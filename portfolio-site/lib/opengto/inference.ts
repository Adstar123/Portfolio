import type * as OrtType from "onnxruntime-web/wasm";
import { ActionType } from "./types";

type OrtModule = typeof OrtType;

let ort: OrtModule | null = null;
let session: OrtType.InferenceSession | null = null;
let loading: Promise<OrtType.InferenceSession> | null = null;

/**
 * Dynamically import onnxruntime-web on the client. A top-level import would
 * run during SSR/prerender on Node and trip an "Invalid URL" error when the
 * bundler's asset paths (e.g. /_next/static/media/...mjs) are resolved
 * against Node's URL parser. Keeping it lazy also means the ~400 KB runtime
 * never ships to users who don't open the trainer.
 *
 * We configure the runtime to:
 *  - Load WASM from /ort/ (self-hosted so our CSP's connect-src allows it,
 *    and to avoid the jsdelivr CDN default).
 *  - Run single-threaded (avoids needing SharedArrayBuffer / COOP+COEP to
 *    boot, which mobile Safari is particularly strict about).
 */
async function loadOrt(): Promise<OrtModule> {
  if (ort) return ort;
  const mod = await import("onnxruntime-web/wasm");
  mod.env.wasm.wasmPaths = "/ort/";
  mod.env.wasm.numThreads = 1;
  ort = mod;
  return mod;
}

/**
 * Lazy-load the ONNX model. Returns cached session on subsequent calls.
 * Guards against concurrent callers racing on the same promise.
 */
export async function getSession(): Promise<OrtType.InferenceSession> {
  if (session) return session;
  if (loading) return loading;

  loading = (async () => {
    const ortMod = await loadOrt();
    const sess = await ortMod.InferenceSession.create(
      "/models/opengto_model.onnx",
      { executionProviders: ["wasm"] }
    );
    session = sess;
    loading = null;
    return sess;
  })();

  return loading;
}

/** Mutex to serialise inference calls (ONNX WASM backend is single-threaded). */
let inferenceQueue: Promise<void> = Promise.resolve();

/**
 * Run inference on a 317-dim feature vector.
 * Returns raw logits (6 values, one per action).
 * Serialised through a queue because the WASM backend cannot handle
 * concurrent .run() calls on the same session.
 */
async function runInference(features: Float32Array): Promise<Float32Array> {
  const sess = await getSession();
  const ortMod = await loadOrt();
  const tensor = new ortMod.Tensor("float32", features, [1, 317]);

  // Queue this inference behind any in-flight call
  const result = new Promise<Float32Array>((resolve, reject) => {
    inferenceQueue = inferenceQueue.then(async () => {
      try {
        const results = await sess.run({ features: tensor });
        const outputName = sess.outputNames[0];
        resolve(results[outputName].data as Float32Array);
      } catch (err) {
        reject(err);
      }
    });
  });

  return result;
}

/**
 * Apply softmax to logits with illegal action masking.
 * legalMask: boolean array of length 6, true = legal.
 *
 * Note: Float32Array.map() and .filter() return Float32Array, not regular
 * arrays, so we convert to a plain number[] first to avoid type issues
 * (e.g. -Infinity cannot be stored in Float32Array, and filter must return
 * a standard array for Math.max spread).
 */
function maskedSoftmax(logits: Float32Array, legalMask: boolean[]): number[] {
  const logitArr = Array.from(logits);
  const masked = logitArr.map((v, i) => (legalMask[i] ? v : -Infinity));
  const finite = masked.filter((v) => v !== -Infinity);
  const maxVal = finite.length > 0 ? Math.max(...finite) : 0;
  const exps = masked.map((v) => (v === -Infinity ? 0 : Math.exp(v - maxVal)));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => (sum > 0 ? v / sum : 0));
}

/**
 * Get GTO strategy for a game state.
 * Returns probability distribution over 6 actions.
 */
export async function getGTOStrategy(
  features: Float32Array,
  legalActions: ActionType[]
): Promise<number[]> {
  const logits = await runInference(features);
  const legalMask = Array.from({ length: 6 }, (_, i) =>
    legalActions.includes(i as ActionType)
  );
  return maskedSoftmax(logits, legalMask);
}

/** Check if the ONNX model has been loaded */
export function isModelLoaded(): boolean {
  return session !== null;
}
