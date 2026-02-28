"use client";

import { motion } from "motion/react";

const name = "Adam Jarick";
const subtitle = "Software Engineer";

export default function HeroText() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center text-center pointer-events-none select-none">
      {/* Name staggered letter reveal */}
      <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight">
        {name.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-block gradient-text"
            style={{ minWidth: char === " " ? "0.3em" : undefined }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </h1>

      {/* Subtitle — typewriter effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: name.length * 0.05 + 0.3, duration: 0.5 }}
        className="mt-4 md:mt-6 flex items-center gap-0"
      >
        {subtitle.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: name.length * 0.05 + 0.5 + i * 0.04,
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
            delay: name.length * 0.05 + 0.5 + subtitle.length * 0.04,
            duration: 0.8,
            repeat: Infinity,
            repeatType: "loop",
          }}
          className="font-mono text-lg sm:text-xl md:text-2xl text-accent-purple ml-0.5"
        >
          |
        </motion.span>
      </motion.div>

      {/* Subtle glow behind text */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[600px] h-[200px] bg-accent-purple/10 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
