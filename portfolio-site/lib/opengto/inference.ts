import * as ort from "onnxruntime-web";
import { ActionType } from "./types";

let session: ort.InferenceSession | null = null;
let loading: Promise<ort.InferenceSession> | null = null;

/**
 * Lazy-load the ONNX model. Returns cached session on subsequent calls.
 * Guards against concurrent callers racing on the same promise.
 */
export async function getSession(): Promise<ort.InferenceSession> {
  if (session) return session;
  if (loading) return loading;

  loading = (async () => {
    const sess = await ort.InferenceSession.create(
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
  const tensor = new ort.Tensor("float32", features, [1, 317]);

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
