"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, GraduationCap, ExternalLink } from "lucide-react";
import Image from "next/image";

// ─── Tech badges ─────────────────────────────────────────────────────────────

const TECH_STACK = [
  { label: "JavaScript", colour: "#f7df1e" },
  { label: "HTML", colour: "#e34f26" },
  { label: "CSS", colour: "#1572b6" },
  { label: "Chrome APIs", colour: "#4285f4" },
  { label: "REST APIs", colour: "#22c55e" },
  { label: "LLM Integration", colour: "#74aa9c" },
  { label: "LaTeX", colour: "#008080" },
];

// ─── Screenshot data ─────────────────────────────────────────────────────────

const SCREENSHOTS = [
  {
    src: "/CopilotLogin.png",
    label: "Login",
    tilt: -2.5,
  },
  {
    src: "/CopilotLoading.png",
    label: "Analysing Learning Data",
    tilt: 1.5,
  },
  {
    src: "/CopilotRecommendations.png",
    label: "Personalised Recommendations",
    tilt: -2,
  },
];

// ─── Page component ──────────────────────────────────────────────────────────

export default function AICopilotPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative px-6 pt-12 pb-10">
        {/* Background gradient effects — fades out smoothly via mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.04) 40%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Title */}
          <motion.h1
            className="font-display uppercase tracking-[0.12em] text-5xl sm:text-6xl md:text-7xl font-normal mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ea580c 100%)",
              }}
            >
              AI Co-Pilot
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-lg sm:text-xl text-zinc-400 font-medium mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            Intelligent Chrome Extension for Personalised Learning
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            A Chrome extension that analyses students&apos; learning data and
            provides AI-powered personalised recommendations. Built as part of a
            university thesis project, it leverages GPT-4 and LangChain to
            deliver targeted learning resources based on individual performance
            patterns.
          </motion.p>

          {/* Tech badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            {TECH_STACK.map((tech) => (
              <span
                key={tech.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  color: tech.colour,
                  borderColor: `${tech.colour}33`,
                  backgroundColor: `${tech.colour}0d`,
                }}
              >
                {tech.label}
              </span>
            ))}
          </motion.div>

          {/* GitHub link */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.25,
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            <a
              href="https://github.com/mahit-c/Thesis-AI-Copilot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-800/80 border border-white/10 hover:border-white/20 hover:text-white transition-colors"
            >
              <Github size={16} />
              View on GitHub
              <ExternalLink size={14} className="text-zinc-500" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Screenshot Showcase ────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-center text-zinc-200 mb-12"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
            {SCREENSHOTS.map((screenshot, index) => (
              <ChromeMockup
                key={screenshot.src}
                src={screenshot.src}
                label={screenshot.label}
                tilt={screenshot.tilt}
                index={index}
                onClick={() => setLightboxImage(screenshot.src)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Results Section ────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="relative rounded-2xl bg-zinc-900/60 border border-white/[0.06] p-8 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          >
            {/* Amber accent bar */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{
                background:
                  "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
              }}
            />

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 mt-0.5">
                <GraduationCap size={24} className="text-amber-400" />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-3">
                  Key Research Outcomes
                </h3>
                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                  Research showed that AI-powered personalised recommendations
                  improved student engagement by providing targeted learning
                  resources based on individual performance data. The system
                  demonstrated the potential for large language models to act as
                  intelligent tutoring assistants, adapting to each
                  student&apos;s unique learning trajectory.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxImage && (
          <Lightbox
            src={lightboxImage}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chrome Mockup Component ─────────────────────────────────────────────────

function ChromeMockup({
  src,
  label,
  tilt,
  index,
  onClick,
}: {
  src: string;
  label: string;
  tilt: number;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-4 cursor-pointer group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 25,
      }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full rounded-xl overflow-hidden"
        style={{
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
        initial={{ rotate: tilt }}
        whileHover={{
          scale: 1.05,
          rotate: 0,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Chrome header bar */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-zinc-800 border-b border-zinc-700/50">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-2">
            <div className="h-4 rounded-md bg-zinc-700/50 max-w-[140px] mx-auto" />
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative aspect-[3/4] bg-zinc-900">
          <Image
            src={src}
            alt={label}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </motion.div>

      {/* Caption */}
      <motion.p
        className="text-sm font-medium text-zinc-400 group-hover:text-amber-400 transition-colors text-center"
        initial={{ rotate: tilt }}
        whileHover={{ rotate: 0 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}

// ─── Lightbox Component ──────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Image */}
      <motion.div
        className="relative z-10 max-w-2xl w-full mx-6 rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chrome header bar (in lightbox too) */}
        <div className="flex items-center gap-1.5 px-4 py-3 bg-zinc-800 border-b border-zinc-700/50">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-3">
            <div className="h-5 rounded-md bg-zinc-700/50 max-w-[200px] mx-auto" />
          </div>
        </div>

        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Full-size screenshot"
            className="w-full h-auto block"
          />
        </div>
      </motion.div>

      {/* Close hint */}
      <motion.p
        className="absolute bottom-8 text-sm text-zinc-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 0.3 }}
      >
        Click anywhere to close
      </motion.p>
    </motion.div>
  );
}
