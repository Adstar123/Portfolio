"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "motion/react";
import type { ExperienceStat } from "@/lib/data";

interface AnimatedCounterProps {
  stat: ExperienceStat;
  delay?: number;
}

export default function AnimatedCounter({
  stat,
  delay = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const controls = animate(0, stat.numericEnd, {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplayValue(Math.round(v)),
      });
      return () => controls.stop();
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, stat.numericEnd, delay]);

  const formattedValue =
    displayValue >= 1000
      ? `${Math.floor(displayValue / 1000)},${String(displayValue % 1000).padStart(3, "0")}`
      : String(displayValue);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="relative">
        <span
          className="font-display text-4xl md:text-5xl lg:text-6xl font-normal tabular-nums"
          style={{
            color: "#f59e0b",
            textShadow:
              "0 0 30px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.15)",
          }}
        >
          {formattedValue}
          {stat.suffix && (
            <span className="text-2xl md:text-3xl lg:text-4xl">
              {stat.suffix}
            </span>
          )}
        </span>
      </div>
      <span className="font-mono text-xs md:text-sm uppercase tracking-[0.15em] text-text-secondary mt-2">
        {stat.label}
      </span>
    </div>
  );
}
