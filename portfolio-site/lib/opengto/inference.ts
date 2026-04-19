import type * as OrtType from "onnxruntime-web/wasm";
import { ActionType } from "./types";

type OrtModule = typeof OrtType;

let ort: OrtModule | null = null;
let session: OrtType.InferenceSession | null = null;
let loading: Promise<OrtType.InferenceSession> | null = null;

/**
 * Load onnxruntime-web at runtime, bypassing the Next.js bundler.
 *
 * Background: Turbopack treats the .mjs files inside onnxruntime-web as
 * static assets and rewrites them to /_next/static/media/<name>.<hash>.mjs
 * with differing hashes for each file. Inside the runtime, the bundled
 * entry uses `new URL('./ort-wasm-simd-threaded.mjs', import.meta.url)`
 * to locate its sibling loader — which resolves to the non-hashed path
 * and 404s, so `InferenceSession.create` rejects almost immediately.
 * `ort.env.wasm.wasmPaths` only redirects the .wasm binary, not the .mjs
 * sibling loader.
 *
 * Fix: self-host the whole /ort/ tree in /public and load the entry via
 * a dynamic import the bundler is told to leave alone. This keeps all of
 * ORT's internal relative lookups on the same origin, all with the
 * filenames ORT expects. The webpackIgnore/turbopackIgnore magic comments
 * prevent the bundler from rewriting the URL.
 *
 * Runtime config:
 *  - wasmPaths = "/ort/" so the .wasm binary resolves alongside the .mjs.
 *  - numThreads = 1 avoids needing SharedArrayBuffer / COOP+COEP, which
 *    mobile Safari is especially strict about.
 */
export async function loadOrt(): Promise<OrtModule> {
  if (ort) return ort;

  // Build the URL at runtime so TypeScript doesn't try to resolve it as a
  // module path at compile time. The magic comments keep the bundler from
  // rewriting the URL — the browser performs a native dynamic import of the
  // file we ship under /public/ort/.
  const url = "/ort/ort.wasm.bundle.min.mjs";
  const mod = (await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */
    url
  )) as OrtModule;

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
