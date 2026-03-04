"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Back navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(12px)" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>
      </motion.nav>

      <main className="pt-16">{children}</main>
    </div>
  );
}
