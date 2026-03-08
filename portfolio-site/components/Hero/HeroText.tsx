"use client";

import { motion } from "motion/react";
import DownloadCVButton from "./DownloadCVButton";

const name = "Adam Jarick";
const subtitle = "Software Engineer";

export default function HeroText() {
  return (
    <motion.div
      className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none select-none"
    >
      {/* Name staggered letter reveal */}
      <h1 className="font-display uppercase tracking-[0.12em] text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal">
        {name.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.8 + i * 0.05,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-block text-text-primary"
            style={{
              minWidth: char === " " ? "0.3em" : undefined,
              textShadow: "0 0 80px rgba(245, 158, 11, 0.3)",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle — typewriter effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: name.length * 0.05 + 1.1, duration: 0.5 }}
        className="mt-4 md:mt-6 flex items-center gap-0"
      >
        {subtitle.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: name.length * 0.05 + 1.3 + i * 0.04,
              duration: 0.01,
            }}
            className="font-body text-lg sm:text-xl md:text-2xl text-text-secondary"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
        {/* Blinking cursor */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            delay: name.length * 0.05 + 1.3 + subtitle.length * 0.04,
            duration: 0.8,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="font-mono text-lg sm:text-xl md:text-2xl text-accent-amber ml-0.5"
        >
          |
        </motion.span>
      </motion.div>

      <DownloadCVButton />

      {/* Subtle glow behind text */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[600px] h-[200px] bg-accent-amber/10 blur-[100px] rounded-full" />
      </div>
    </motion.div>
  );
}
