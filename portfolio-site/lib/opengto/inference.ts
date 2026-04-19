import { ActionType } from "./types";

/**
 * Client-side inference client. The actual neural network runs on the
 * server (app/api/opengto/infer/route.ts) because the onnxruntime-web
 * WASM runtime is ~12 MB and hits iOS Safari's per-tab WASM memory
 * budget with `RangeError: Out of memory` during instantiation. Running
 * inference server-side via onnxruntime-node has a fixed ~50 ms cold
 * start and sub-millisecond per-call latency, which works everywhere.
 */

const INFER_ENDPOINT = "/api/opengto/infer";

interface InferItem {
  features: number[];
  legalActions: number[];
}
interface InferResponse {
  probs: number[][];
}

async function postInfer(items: InferItem[]): Promise<number[][]> {
  const res = await fetch(INFER_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) detail = `${detail}: ${data.error}`;
    } catch {
      /* ignore */
    }
    throw new Error(`Inference request failed — ${detail}`);
  }
  const data = (await res.json()) as InferResponse;
  if (!data || !Array.isArray(data.probs)) {
    throw new Error("Malformed inference response");
  }
  return data.probs;
}

/**
 * Warm the server session (and the browser's connection to /api/opengto/infer)
 * so the first real inference call isn't paying cold-start cost. Errors
 * propagate — if the server can't load the model at all, the trainer can't
 * work, and we want that surfaced in the loading UI instead of the user
 * hitting a silent failure on their first action.
 */
export async function getSession(): Promise<void> {
  // Zero-filled feature vector + all actions legal — cheap dummy inference
  // to load the model on the server.
  const features = new Array<number>(317).fill(0);
  await postInfer([{ features, legalActions: [0, 1, 2, 3, 4, 5] }]);
}

/**
 * Convert the plain JS feature array (Float32Array or number[]) to a
 * plain number[] the JSON body can carry.
 */
function toPlainArray(features: Float32Array | number[]): number[] {
  if (Array.isArray(features)) return features;
  return Array.from(features);
}

/**
 * Get GTO strategy for a single game state.
 * Returns a length-6 probability distribution over the ActionType enum.
 */
export async function getGTOStrategy(
  features: Float32Array | number[],
  legalActions: ActionType[]
): Promise<number[]> {
  const [probs] = await postInfer([
    { features: toPlainArray(features), legalActions: legalActions as number[] },
  ]);
  return probs;
}

/**
 * Batched variant for the Range Viewer, which needs 169 inferences.
 * Sent as a single HTTP request to avoid 169 round-trips.
 */
export async function getGTOStrategyBatch(
  items: Array<{ features: Float32Array | number[]; legalActions: ActionType[] }>
): Promise<number[][]> {
  if (items.length === 0) return [];
  const body: InferItem[] = items.map((it) => ({
    features: toPlainArray(it.features),
    legalActions: it.legalActions as number[],
  }));
  return postInfer(body);
}

/** Kept as a warm-up helper for backward compatibility with existing call sites. */
export async function loadOrt(): Promise<void> {
  // Nothing to load client-side anymore. The server handles ONNX.
}

/** Unused now — inference is remote — but kept so existing imports compile. */
export function isModelLoaded(): boolean {
  return true;
}
