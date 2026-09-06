"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Download, ArrowUpRight } from "lucide-react";

const RESUME_PATH = "/Adam_Jarick_2026_Resume.pdf";

const HIGHLIGHTS = [
  "Full stack · AI/ML",
  "Building Commission NSW",
  "Bugcrowd P1 · CVSS 9.8",
  "Baseline clearance",
];

const META = ["PDF", "2 pages", "Updated Sept 2026"];

export default function ResumeSection() {
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
      if (distance < 140) {
        const pull = (1 - distance / 140) * 8;
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
    <section
      id="resume"
      className="relative z-[10] py-[120px] md:py-[160px] px-[var(--pad)]"
    >
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Section index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-12 gap-x-8 mb-12 pb-10 border-b"
          style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
        >
          <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              005 / Dossier
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(40px, 6vw, 88px)",
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                maxWidth: "18ch",
              }}
            >
              The full{" "}
              <span
                className="font-serif italic"
                style={{ color: "#ff5b1f", fontWeight: 400 }}
              >
                record
              </span>
              .
            </h2>
          </div>
        </motion.div>

        {/* Body */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-12 items-center">
          {/* Copy + download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="col-span-12 md:col-span-7 flex flex-col gap-8"
          >
            <p
              className="font-body text-lg md:text-xl leading-relaxed"
              style={{ color: "#b8b4a8", maxWidth: "40ch" }}
            >
              Every role, project and number in one place. Two pages, kept
              current.
            </p>

            {/* Download button (magnetic, gradient border) */}
            <div
              className="pointer-events-auto"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                ref={buttonRef}
                style={{ x: springX, y: springY }}
                onMouseEnter={() => setIsHovered(true)}
                className="inline-block"
              >
                <div className="relative group rounded-full p-[1px] inline-block">
                  <div
                    className="absolute inset-0 rounded-full nav-gradient-border transition-opacity duration-300"
                    style={{ opacity: isHovered ? 1 : 0.5 }}
                  />
                  <div
                    className="absolute inset-0 rounded-full nav-gradient-border blur-md transition-opacity duration-300"
                    style={{
                      opacity: isHovered ? 0.4 : 0.15,
                      animation:
                        "glow-pulse 2s ease-in-out infinite, nav-border-rotate 6s linear infinite",
                    }}
                  />
                  <motion.a
                    href={RESUME_PATH}
                    download
                    data-cursor-hover
                    whileTap={{ scale: 0.95 }}
                    className="relative z-10 flex items-center gap-2.5 rounded-full px-7 py-3.5 font-body text-sm font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-200"
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
                    Download résumé
                  </motion.a>
                </div>
              </motion.div>
            </div>

            {/* View in browser */}
            <a
              href={RESUME_PATH}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors w-fit"
              style={{ color: "#6e6b62" }}
            >
              View in browser
              <ArrowUpRight size={13} strokeWidth={2} />
            </a>

            {/* Meta row */}
            <div className="flex items-center gap-3 flex-wrap">
              {META.map((m, i) => (
                <div key={m} className="flex items-center gap-3">
                  {i > 0 && (
                    <span style={{ color: "#3a3a3a" }} aria-hidden>
                      ·
                    </span>
                  )}
                  <span
                    className="font-mono text-[11px] tracking-[0.18em] uppercase"
                    style={{ color: "#6e6b62" }}
                  >
                    {m}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Highlight chips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="col-span-12 md:col-span-5"
          >
            <div
              className="md:pl-8 space-y-3"
              style={{ borderLeft: "1px solid rgba(242, 239, 232, 0.14)" }}
            >
              <div
                className="font-mono text-[10px] tracking-[0.22em] uppercase pb-3"
                style={{
                  color: "#6e6b62",
                  borderBottom: "1px solid rgba(242, 239, 232, 0.14)",
                  marginBottom: 12,
                }}
              >
                On the page
              </div>
              {HIGHLIGHTS.map((h) => (
                <div
                  key={h}
                  className="grid items-center gap-3 py-3"
                  style={{
                    gridTemplateColumns: "16px 1fr",
                    color: "#f2efe8",
                    borderBottom: "1px solid rgba(242, 239, 232, 0.06)",
                  }}
                >
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: "#ff5b1f" }}
                    aria-hidden
                  >
                    ↳
                  </span>
                  <span className="font-display text-[15px]">{h}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
