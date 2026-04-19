#!/usr/bin/env node
/**
 * Strips onnxruntime-node's non-Linux-x64 platform binaries before Vercel
 * packages the serverless function.
 *
 * Why: onnxruntime-node ships prebuilt native binaries for darwin/arm64,
 * linux/arm64, linux/x64, win32/arm64, win32/x64 — ~336 MB total. Vercel
 * packages the full `node_modules/onnxruntime-node` directory into each
 * function that imports it, blowing past the 250 MB uncompressed limit.
 * Next.js' `outputFileTracingExcludes` doesn't help because Vercel treats
 * server-external packages as opaque and copies the whole thing.
 *
 * Fix: physically remove the unused platform binaries from node_modules
 * during the Vercel build. The binaries simply won't exist for Vercel to
 * copy. Only runs on Vercel so it doesn't nuke local dev binaries.
 */
const fs = require("node:fs");
const path = require("node:path");

// Bail out if we're not running on Vercel — don't destroy local binaries.
if (process.env.VERCEL !== "1") {
  console.log("[strip-ort-binaries] not on Vercel, skipping");
  process.exit(0);
}

const ortBinRoot = path.join(
  __dirname,
  "..",
  "node_modules",
  "onnxruntime-node",
  "bin",
  "napi-v6"
);

if (!fs.existsSync(ortBinRoot)) {
  console.log(`[strip-ort-binaries] ${ortBinRoot} missing; nothing to strip`);
  process.exit(0);
}

const KEEP = new Set(["linux/x64"]);
let removed = 0;

for (const platform of fs.readdirSync(ortBinRoot)) {
  const platformDir = path.join(ortBinRoot, platform);
  if (!fs.statSync(platformDir).isDirectory()) continue;
  for (const arch of fs.readdirSync(platformDir)) {
    const rel = `${platform}/${arch}`;
    if (KEEP.has(rel)) continue;
    const archDir = path.join(platformDir, arch);
    fs.rmSync(archDir, { recursive: true, force: true });
    console.log(`[strip-ort-binaries] removed ${rel}`);
    removed++;
  }
}

console.log(
  `[strip-ort-binaries] done — removed ${removed} platform directories`
);
