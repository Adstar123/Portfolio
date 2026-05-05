"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

export default function HeroIntro() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const adamChars = "Adam".split("");
  const jarickChars = "Jarick.".split("");

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className="relative z-[10] flex flex-col justify-between min-h-screen"
    >
      {/* Spacer to push the title down past the HUD brand */}
      <div className="pt-[120px]" />

      {/* The big name */}
      <div className="px-[var(--pad)] flex-1 flex flex-col justify-center pointer-events-auto">
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(80px, 16vw, 280px)",
            lineHeight: 0.92,
            letterSpacing: "-0.05em",
            fontWeight: 500,
            color: "#f2efe8",
          }}
        >
          <span className="block">
            {adamChars.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.45 + i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
                style={{ willChange: "transform" }}
              >
                {c}
              </motion.span>
            ))}
          </span>
          <span
            className="block font-serif italic"
            style={{ color: "#ff5b1f", fontWeight: 400 }}
          >
            {jarickChars.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.85 + i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inline-block"
              >
                {c}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4 }}
          className="mt-12 font-display max-w-[36ch]"
          style={{
            fontSize: "clamp(17px, 1.4vw, 22px)",
            lineHeight: 1.5,
            color: "#b8b4a8",
            fontWeight: 300,
          }}
        >
          Builds software for the{" "}
          <span style={{ color: "#ff5b1f" }}>Building Commission</span>{" "}
          at NSW DCS.
        </motion.p>
      </div>

      {/* Bottom — meta strip + scroll hint */}
      <div className="px-[var(--pad)] pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1.7 }}
          className="flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "#6e6b62" }}
        >
          <span style={{ color: "#ff5b1f" }} className="inline-block">
            ↓
          </span>
          <span style={{ animation: "bob 1.6s ease-in-out infinite" }}>
            Scroll to enter
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
