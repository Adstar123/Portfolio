"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";

export default function LampEffect() {
  const beamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!beamRef.current) return;
      const tilt = (e.clientX / window.innerWidth - 0.5) * 6;
      beamRef.current.style.transform = `perspective(1000px) rotateY(${tilt}deg)`;
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main conic beam */}
      <motion.div
        ref={beamRef}
        initial={{ opacity: 0, scaleX: 0.05, scaleY: 0.3 }}
        animate={{ opacity: 1, scaleX: 1, scaleY: 1 }}
        transition={{
          duration: 1.5,
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2,
        }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full transition-transform duration-[1.5s] ease-out"
        style={{
          height: "85%",
          background:
            "conic-gradient(from 270deg at 50% 100%, transparent 30%, rgba(245, 158, 11, 0.06) 37%, rgba(245, 158, 11, 0.12) 45%, rgba(251, 191, 36, 0.15) 50%, rgba(245, 158, 11, 0.12) 55%, rgba(245, 158, 11, 0.06) 63%, transparent 70%)",
          maskImage:
            "linear-gradient(to top, black 10%, transparent 90%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 10%, transparent 90%)",
        }}
      />

      {/* Secondary wider, softer beam for depth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%]"
        style={{
          height: "70%",
          background:
            "conic-gradient(from 270deg at 50% 100%, transparent 25%, rgba(245, 158, 11, 0.03) 40%, rgba(245, 158, 11, 0.06) 50%, rgba(245, 158, 11, 0.03) 60%, transparent 75%)",
          maskImage:
            "linear-gradient(to top, black 5%, transparent 80%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 5%, transparent 80%)",
        }}
      />

      {/* Glow at the base */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent)",
          boxShadow:
            "0 0 40px 15px rgba(245, 158, 11, 0.3), 0 0 80px 30px rgba(245, 158, 11, 0.15)",
        }}
      />
    </div>
  );
}
