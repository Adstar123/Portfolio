"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

interface Particle {
  id: number;
  left: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  startY: string;
}

export default function FloatingParticles({ count = 25 }: { count?: number }) {
  const particles: Particle[] = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${15 + Math.random() * 70}%`,
      size: 1.5 + Math.random() * 3,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      driftX: -20 + Math.random() * 40,
      startY: `${60 + Math.random() * 35}%`,
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 + p.delay * 0.3, duration: 1 }}
          className="absolute rounded-full"
          style={
            {
              left: p.left,
              top: p.startY,
              width: p.size,
              height: p.size,
              background:
                "radial-gradient(circle, rgba(251, 191, 36, 0.9), rgba(245, 158, 11, 0.4))",
              boxShadow: `0 0 ${p.size * 2}px rgba(245, 158, 11, 0.3)`,
              animation: `spark-rise ${p.duration}s ${p.delay}s linear infinite`,
              "--drift-x": `${p.driftX}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
