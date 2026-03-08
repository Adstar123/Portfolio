"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Download } from "lucide-react";

export default function DownloadCVButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < 120) {
        const pull = (1 - distance / 120) * 8;
        mouseX.set((distX / distance) * pull);
        mouseY.set((distY / distance) * pull);
      } else {
        mouseX.set(0);
        mouseY.set(0);
      }
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.8, duration: 0.6, ease: "easeOut" }}
      className="mt-8 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={buttonRef}
        style={{ x: springX, y: springY }}
        onMouseEnter={() => setIsHovered(true)}
      >
        <div className="relative group rounded-full p-[1px]">
          <div
            className="absolute inset-0 rounded-full nav-gradient-border transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.5 }}
          />
          <div
            className="absolute inset-0 rounded-full nav-gradient-border blur-md transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.4 : 0.15,
              animation: "glow-pulse 2s ease-in-out infinite, nav-border-rotate 6s linear infinite",
            }}
          />
          <motion.a
            href="/Adam_Jarick_2026_Resume.pdf"
            download
            whileTap={{ scale: 0.95 }}
            className="relative z-10 flex items-center gap-2.5 rounded-full px-6 py-3 font-body text-sm font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-200"
            style={{
              background: isHovered
                ? "rgba(245, 158, 11, 0.1)"
                : "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <motion.span
              animate={isHovered ? { y: [0, 3, 0] } : { y: 0 }}
              transition={{
                duration: 0.6,
                repeat: isHovered ? Infinity : 0,
                repeatType: "loop",
              }}
              className="flex items-center"
            >
              <Download size={16} strokeWidth={2} />
            </motion.span>
            Download CV
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
