import { NextResponse } from "next/server";
import path from "node:path";
import * as ort from "onnxruntime-node";

// Force Node runtime — onnxruntime-node uses native bindings (not Edge).
export const runtime = "nodejs";
// Increase the default timeout a bit; 169-item range queries take ~500 ms
// to a few seconds depending on cold start.
export const maxDuration = 30;

const MODEL_PATH = path.join(process.cwd(), "public", "models", "opengto_model.onnx");
const FEATURES = 317;
const ACTIONS = 6;
const MAX_BATCH = 256;

let session: ort.InferenceSession | null = null;
let loading: Promise<ort.InferenceSession> | null = null;

async function getSession(): Promise<ort.InferenceSession> {
  if (session) return session;
  if (loading) return loading;
  loading = ort.InferenceSession.create(MODEL_PATH).then((s) => {
    session = s;
    loading = null;
    return s;
  });
  return loading;
}

interface InferItem {
  features: number[];
  legalActions: number[];
}
interface InferRequest {
  items: InferItem[];
}

function isValidItem(x: unknown): x is InferItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (!Array.isArray(o.features) || o.features.length !== FEATURES) return false;
  if (!o.features.every((v) => typeof v === "number" && Number.isFinite(v))) return false;
  if (!Array.isArray(o.legalActions)) return false;
  if (
    !o.legalActions.every(
      (v) => typeof v === "number" && Number.isInteger(v) && v >= 0 && v < ACTIONS
    )
  )
    return false;
  return true;
}

/** Masked softmax applied in-place semantics: returns a new 6-length array. */
function maskedSoftmax(logits: Float32Array, legal: number[]): number[] {
  const isLegal = new Array<boolean>(ACTIONS).fill(false);
  for (const a of legal) isLegal[a] = true;

  let maxVal = -Infinity;
  for (let i = 0; i < ACTIONS; i++) {
    if (isLegal[i] && logits[i] > maxVal) maxVal = logits[i];
  }
  if (!Number.isFinite(maxVal)) maxVal = 0;

  const exps = new Array<number>(ACTIONS);
  let sum = 0;
  for (let i = 0; i < ACTIONS; i++) {
    const v = isLegal[i] ? Math.exp(logits[i] - maxVal) : 0;
    exps[i] = v;
    sum += v;
  }
  if (sum === 0) return exps;
  for (let i = 0; i < ACTIONS; i++) exps[i] /= sum;
  return exps;
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { items } = body as Partial<InferRequest>;
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
    }
    if (items.length > MAX_BATCH) {
      return NextResponse.json(
        { error: `items length ${items.length} exceeds max ${MAX_BATCH}` },
        { status: 400 }
      );
    }
    for (let i = 0; i < items.length; i++) {
      if (!isValidItem(items[i])) {
        return NextResponse.json({ error: `invalid item at index ${i}` }, { status: 400 });
      }
    }

    const sess = await getSession();
    const N = items.length;
    const flat = new Float32Array(N * FEATURES);
    for (let i = 0; i < N; i++) {
      const src = items[i].features;
      flat.set(src, i * FEATURES);
    }
    const tensor = new ort.Tensor("float32", flat, [N, FEATURES]);
    const results = await sess.run({ features: tensor });
    const outputName = sess.outputNames[0];
    const logits = results[outputName].data as Float32Array; // shape [N, 6]

    const probs: number[][] = new Array(N);
    for (let i = 0; i < N; i++) {
      const row = logits.subarray(i * ACTIONS, (i + 1) * ACTIONS);
      probs[i] = maskedSoftmax(row, items[i].legalActions);
    }

    return NextResponse.json({ probs });
  } catch (err) {
    console.error("opengto infer error:", err);
    const message = err instanceof Error ? err.message : "Inference failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
