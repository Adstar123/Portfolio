import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The /api/opengto/infer serverless function needs extra files that
  // Next.js' static tracer won't pick up on its own:
  //  - The ONNX model (loaded at runtime via `process.cwd()` path join).
  //  - The onnxruntime-node Linux x64 binaries. Tracing on Windows/macOS
  //    only resolves the host platform's .node file, but Vercel runs on
  //    Linux x64. We force both the Linux binding and its shared library
  //    to be included so the function actually starts on Vercel.
  outputFileTracingIncludes: {
    "/api/opengto/infer": [
      "public/models/opengto_model.onnx",
      "node_modules/onnxruntime-node/bin/napi-v6/linux/x64/**",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self' api.iconify.design va.vercel-scripts.com",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
