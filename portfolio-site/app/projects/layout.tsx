"use client";

import { motion } from "motion/react";
import Link from "next/link";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative" style={{ background: "#07080a", color: "#f2efe8" }}>
      {/* HUD: Brand + Back nav */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 z-50 px-[var(--pad,32px)] py-[26px] flex items-center gap-3"
        style={{ mixBlendMode: "difference", color: "#fafafa" }}
      >
        <span
          className="inline-block w-[8px] h-[8px] rounded-full"
          style={{
            background: "#ff5b1f",
            animation: "pulse-dot 2s ease-in-out infinite",
            boxShadow: "0 0 10px rgba(255,91,31,0.8)",
          }}
        />
        <Link
          href="/"
          className="font-mono text-[11px] tracking-[0.22em] uppercase transition-opacity hover:opacity-70"
        >
          ← Adam Jarick
        </Link>
      </motion.div>

      <main className="pt-24 pb-16">{children}</main>
    </div>
  );
}
