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
    <div className="absolute inset-0 pointer-events-none">
      {/* Main conic beam — very soft gradient, no hard edges */}
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
          height: "90%",
          background:
            "conic-gradient(from 270deg at 50% 100%, transparent 32%, rgba(245, 158, 11, 0.02) 36%, rgba(245, 158, 11, 0.05) 40%, rgba(245, 158, 11, 0.09) 44%, rgba(251, 191, 36, 0.12) 48%, rgba(251, 191, 36, 0.13) 50%, rgba(251, 191, 36, 0.12) 52%, rgba(245, 158, 11, 0.09) 56%, rgba(245, 158, 11, 0.05) 60%, rgba(245, 158, 11, 0.02) 64%, transparent 68%)",
          maskImage:
            "radial-gradient(ellipse 80% 90% at 50% 100%, black 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 60%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 90% at 50% 100%, black 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.2) 60%, transparent 85%)",
        }}
      />

      {/* Secondary wider, softer beam for depth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[130%]"
        style={{
          height: "75%",
          background:
            "conic-gradient(from 270deg at 50% 100%, transparent 28%, rgba(245, 158, 11, 0.01) 35%, rgba(245, 158, 11, 0.04) 45%, rgba(245, 158, 11, 0.05) 50%, rgba(245, 158, 11, 0.04) 55%, rgba(245, 158, 11, 0.01) 65%, transparent 72%)",
          maskImage:
            "radial-gradient(ellipse 90% 85% at 50% 100%, black 0%, rgba(0,0,0,0.4) 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 85% at 50% 100%, black 0%, rgba(0,0,0,0.4) 40%, transparent 75%)",
        }}
      />

      {/* Soft glow at the base — no hard 2px line, just a diffused glow */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[70%] h-[60px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.25) 0%, rgba(251, 191, 36, 0.1) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}
