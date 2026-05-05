"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const ACTS: {
  key: string;
  label: string;
  numeral: string;
  matches: string[];
}[] = [
  { key: "hero", label: "PROLOGUE", numeral: "I", matches: ["hero", "about"] },
  {
    key: "experience",
    label: "TRACK RECORD",
    numeral: "II",
    matches: ["experience"],
  },
  { key: "skills", label: "TOOLKIT", numeral: "III", matches: ["skills"] },
  { key: "projects", label: "THE WORK", numeral: "IV", matches: ["projects"] },
  { key: "contact", label: "GROUND", numeral: "V", matches: ["contact"] },
];

export default function HudChrome() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function update() {
      const max = document.body.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? window.scrollY / max : 0;
      setProgress(ratio);

      // Find which act has a section most centred in viewport
      const mid = window.scrollY + window.innerHeight / 2;
      let bestActIdx = 0;
      let bestDist = Infinity;
      ACTS.forEach((act, i) => {
        for (const id of act.matches) {
          const el = document.getElementById(id);
          if (!el) continue;
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          // Distance from mid to nearest edge of section (0 if inside)
          const d =
            mid < top ? top - mid : mid > bottom ? mid - bottom : 0;
          if (d < bestDist) {
            bestDist = d;
            bestActIdx = i;
          }
        }
      });
      setActive(bestActIdx);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      {/* Top-left brand HUD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="fixed top-0 left-0 z-50 px-[var(--pad)] py-[26px] flex items-center gap-3 pointer-events-none"
        style={{ mixBlendMode: "difference", color: "#fafafa" }}
      >
        <span
          className="inline-block w-[8px] h-[8px] rounded-full pointer-events-auto"
          style={{
            background: "#ff5b1f",
            animation: "pulse-dot 2s ease-in-out infinite",
            boxShadow: "0 0 10px rgba(255,91,31,0.8)",
          }}
        />
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase pointer-events-auto">
          Adam Jarick
        </span>
      </motion.div>

      {/* Top-right act counter */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="fixed top-0 right-0 z-50 px-[var(--pad)] py-[26px] flex items-center gap-3 pointer-events-none"
        style={{ mixBlendMode: "difference", color: "#fafafa" }}
      >
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase pointer-events-auto">
          {String(active + 1).padStart(2, "0")} / {String(ACTS.length).padStart(2, "0")}
        </span>
        <span className="opacity-40">·</span>
        <motion.span
          key={ACTS[active].label}
          initial={{ opacity: 0, x: 6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="font-mono text-[11px] tracking-[0.22em] uppercase pointer-events-auto"
          style={{ color: "#ff5b1f", mixBlendMode: "normal" }}
        >
          {ACTS[active].label}
        </motion.span>
      </motion.div>

      {/* Right edge scroll rail */}
      <div
        className="fixed right-[24px] top-1/2 -translate-y-1/2 z-40 hidden md:block pointer-events-none"
        style={{ height: "60vh" }}
      >
        <div
          className="absolute right-0 top-0 bottom-0 w-[2px]"
          style={{ background: "rgba(242, 239, 232, 0.14)" }}
        />
        <div
          className="absolute right-0 top-0 w-[2px]"
          style={{
            background: "#ff5b1f",
            height: `${progress * 100}%`,
            transition: "height 0.2s linear",
            boxShadow: "0 0 8px rgba(255,91,31,0.6)",
          }}
        />
        <ul className="absolute right-[14px] top-0 bottom-0 flex flex-col justify-between m-0 p-0 list-none pointer-events-auto">
          {ACTS.map((act, i) => (
            <li
              key={act.key}
              className="flex items-center gap-2 whitespace-nowrap font-mono text-[10px] tracking-[0.18em] uppercase cursor-pointer transition-all"
              style={{
                color: i === active ? "#ff5b1f" : "rgba(242, 239, 232, 0.45)",
                transform: i === active ? "translateX(-4px)" : "none",
              }}
              onClick={() => {
                document
                  .getElementById(act.key)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <span
                style={{
                  opacity: i === active ? 1 : 0,
                  transform: i === active ? "translateX(0)" : "translateX(6px)",
                  transition: "opacity 0.3s, transform 0.3s",
                  display: "inline-block",
                }}
              >
                {act.label.toLowerCase()}
              </span>
              <span style={{ opacity: 0.7 }}>{act.numeral}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
