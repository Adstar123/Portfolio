#!/usr/bin/env node
/**
 * Strips onnxruntime-node's unused platform binaries before Next.js / Vercel
 * packages the serverless function.
 *
 * Why: onnxruntime-node ships prebuilt native binaries for darwin/arm64,
 * linux/arm64, linux/x64, win32/arm64, win32/x64 — ~336 MB total. Vercel
 * packages the full `node_modules/onnxruntime-node` directory into each
 * function that imports it, blowing past the 250 MB uncompressed limit.
 * `outputFileTracingExcludes` and Next.js' server-external config don't
 * help: Vercel treats server-external packages as opaque and copies the
 * whole thing.
 *
 * Fix: physically remove binaries for platforms we're not deploying to.
 * Vercel runs Linux x64, so that's the one we MUST keep. We also keep the
 * current host platform so local dev on macOS/Windows continues to work
 * (the build step runs locally too, and removing the host's own binary
 * would break any subsequent `next dev`).
 */
const fs = require("node:fs");
const path = require("node:path");

const ortBinRoot = path.join(
  __dirname,
  "..",
  "node_modules",
  "onnxruntime-node",
  "bin",
  "napi-v6"
);

console.log("[strip-ort-binaries] CWD:", process.cwd());
console.log("[strip-ort-binaries] script dir:", __dirname);
console.log("[strip-ort-binaries] target:", ortBinRoot);
console.log("[strip-ort-binaries] VERCEL env:", process.env.VERCEL ?? "(unset)");
console.log(
  "[strip-ort-binaries] host:",
  `${process.platform}/${process.arch}`
);

if (!fs.existsSync(ortBinRoot)) {
  console.log(`[strip-ort-binaries] target missing — nothing to strip`);
  process.exit(0);
}

// Always keep Linux x64 (Vercel's runtime) + the current host platform so
// local dev keeps working.
const KEEP = new Set(["linux/x64", `${process.platform}/${process.arch}`]);
console.log("[strip-ort-binaries] keeping:", [...KEEP]);

let removed = 0;
let kept = 0;
let totalBytesRemoved = 0;

function dirSize(p) {
  let size = 0;
  for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
    const full = path.join(p, entry.name);
    if (entry.isDirectory()) size += dirSize(full);
    else if (entry.isFile()) size += fs.statSync(full).size;
  }
  return size;
}

for (const platform of fs.readdirSync(ortBinRoot)) {
  const platformDir = path.join(ortBinRoot, platform);
  if (!fs.statSync(platformDir).isDirectory()) continue;
  for (const arch of fs.readdirSync(platformDir)) {
    const rel = `${platform}/${arch}`;
    const archDir = path.join(platformDir, arch);
    if (KEEP.has(rel)) {
      kept++;
      console.log(`[strip-ort-binaries] keep ${rel}`);
      continue;
    }
    const bytes = dirSize(archDir);
    totalBytesRemoved += bytes;
    fs.rmSync(archDir, { recursive: true, force: true });
    removed++;
    console.log(
      `[strip-ort-binaries] removed ${rel} (${(bytes / 1048576).toFixed(1)} MB)`
    );
  }
}

console.log(
  `[strip-ort-binaries] done — kept ${kept}, removed ${removed}, freed ${(
    totalBytesRemoved / 1048576
  ).toFixed(1)} MB`
);

// Post-strip audit: show what's actually left.
try {
  for (const platform of fs.readdirSync(ortBinRoot)) {
    const platformDir = path.join(ortBinRoot, platform);
    if (!fs.statSync(platformDir).isDirectory()) continue;
    for (const arch of fs.readdirSync(platformDir)) {
      const full = path.join(platformDir, arch);
      console.log(
        `[strip-ort-binaries] remaining: ${platform}/${arch} (${(
          dirSize(full) / 1048576
        ).toFixed(1)} MB)`
      );
    }
  }
} catch (err) {
  console.warn("[strip-ort-binaries] audit failed:", err);
}
