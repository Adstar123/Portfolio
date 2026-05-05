"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Icon } from "@iconify/react";

const TECH_STACK = [
  "JavaScript",
  "Chrome APIs",
  "REST APIs",
  "SCORM",
  "Moodle",
  "LLM",
  "LaTeX",
];

const SCREENSHOTS = [
  {
    src: "/CopilotLogin.png",
    label: "Login",
    description: "Student authenticates with their portal ID.",
    num: "01",
  },
  {
    src: "/CopilotLoading.png",
    label: "Analysing",
    description:
      "Pulls quiz scores, time-on-page, skipped lessons and link clicks.",
    num: "02",
  },
  {
    src: "/CopilotRecommendations.png",
    label: "Recommendations",
    description:
      "LLM surfaces personalised next-steps based on engagement signals.",
    num: "03",
  },
];

const SIGNALS = [
  {
    label: "Quiz performance",
    detail: "Per-section scores, miss patterns, and answer-time per question.",
  },
  {
    label: "Engagement time",
    detail:
      "Time spent on each piece of content compared to the per-lesson target.",
  },
  {
    label: "Lesson skips",
    detail:
      "Which sections were jumped past versus completed end-to-end.",
  },
  {
    label: "Link clicks",
    detail:
      "Whether linked readings, case studies, and external references were opened.",
  },
  {
    label: "Quiz retry attempts",
    detail:
      "Number of attempts before passing a quiz and the score gradient between tries.",
  },
  {
    label: "Scroll depth",
    detail:
      "How far down each lesson page the student actually scrolled.",
  },
  {
    label: "Video pauses & rewinds",
    detail:
      "Where students paused, rewound, or sped up embedded video content.",
  },
  {
    label: "Bookmarks & notes",
    detail:
      "Which items the student saved or annotated for later review.",
  },
  {
    label: "Session pacing",
    detail:
      "Length and frequency of study sessions across the week.",
  },
  {
    label: "Drop-off points",
    detail:
      "Where in a lesson the student tends to disengage or close the tab.",
  },
];

export default function AICopilotPage() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-[var(--pad,32px)] pt-12 pb-12">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-12 gap-x-8 mb-10 pb-8 border-b"
            style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
          >
            <div className="col-span-12 md:col-span-2 mb-4 md:mb-0">
              <span
                className="font-mono text-[11px] tracking-[0.22em] uppercase"
                style={{ color: "#ff5b1f" }}
              >
                PRJ / 02
              </span>
            </div>
            <div className="col-span-12 md:col-span-7">
              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(48px, 7vw, 100px)",
                  fontWeight: 500,
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  color: "#f2efe8",
                }}
              >
                AI{" "}
                <span
                  className="font-serif italic"
                  style={{ color: "#ff5b1f", fontWeight: 400 }}
                >
                  Co-Pilot
                </span>
                .
              </h1>
              <p
                className="font-serif italic mt-3"
                style={{
                  fontSize: "clamp(18px, 1.6vw, 22px)",
                  color: "#b8b4a8",
                  maxWidth: "32ch",
                }}
              >
                Honours thesis. A Chrome extension turning learning analytics
                into personalised recommendations.
              </p>
              <p
                className="mt-4 max-w-[60ch]"
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#b8b4a8",
                }}
              >
                Reads quiz scores, content engagement time, skipped lessons
                and link clicks from SCORM and Moodle, then routes those
                signals through an LLM to deliver tailored next-step
                recommendations directly inside the student&apos;s LMS.
                Demonstrated lift in engagement and module completion.
              </p>
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-4 md:items-end">
              <a
                href="https://github.com/mahit-c/Thesis-AI-Copilot"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                className="inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-[0.16em] uppercase transition-all"
                style={{
                  border: "1px solid rgba(242, 239, 232, 0.3)",
                  color: "#f2efe8",
                }}
              >
                <Github size={14} />
                GitHub
                <ArrowUpRight size={12} />
              </a>
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {TECH_STACK.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] tracking-[0.06em] uppercase px-2 py-[3px] border"
                    style={{
                      borderColor: "rgba(242, 239, 232, 0.14)",
                      color: "#b8b4a8",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="px-[var(--pad,32px)] pb-16">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-10 flex items-end justify-between gap-6 flex-wrap"
          >
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(28px, 3vw, 44px)",
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "#f2efe8",
              }}
            >
              How it{" "}
              <span
                className="font-serif italic"
                style={{ color: "#ff5b1f", fontWeight: 400 }}
              >
                works.
              </span>
            </h2>
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              The flow
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {SCREENSHOTS.map((s, index) => (
              <ChromeShot
                key={s.src}
                src={s.src}
                label={s.label}
                description={s.description}
                num={s.num}
                index={index}
                onClick={() => setLightboxImage(s.src)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Signals */}
      <section className="px-[var(--pad,32px)] pb-16">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-12 gap-x-8 mb-8"
          >
            <div className="col-span-12 md:col-span-2 mb-4 md:mb-0">
              <span
                className="font-mono text-[11px] tracking-[0.22em] uppercase"
                style={{ color: "#ff5b1f" }}
              >
                Inputs
              </span>
            </div>
            <div className="col-span-12 md:col-span-10">
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(28px, 3vw, 44px)",
                  fontWeight: 500,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "#f2efe8",
                }}
              >
                The{" "}
                <span
                  className="font-serif italic"
                  style={{ color: "#ff5b1f", fontWeight: 400 }}
                >
                  signals
                </span>{" "}
                we read.
              </h2>
            </div>
          </motion.div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-px"
            style={{
              background: "rgba(242, 239, 232, 0.14)",
              border: "1px solid rgba(242, 239, 232, 0.14)",
            }}
          >
            {SIGNALS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="p-7"
                style={{ background: "#0c0e12" }}
              >
                <span
                  className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3 block"
                  style={{ color: "#ff5b1f" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="font-display mb-2"
                  style={{
                    fontSize: 22,
                    fontWeight: 500,
                    color: "#f2efe8",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {s.label}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ fontSize: 14, color: "#b8b4a8" }}
                >
                  {s.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
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

// ─── Chrome screenshot card ──────────────────────────────────────────────────

function ChromeShot({
  src,
  label,
  description,
  num,
  index,
  onClick,
}: {
  src: string;
  label: string;
  description: string;
  num: string;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      data-cursor-hover
      className="flex flex-col items-stretch gap-4 text-left"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        delay: index * 0.12,
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        className="relative w-full overflow-hidden"
        style={{
          boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
          border: "1px solid rgba(242, 239, 232, 0.06)",
        }}
        whileHover={{
          y: -4,
          transition: { duration: 0.3 },
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-3 py-2.5"
          style={{
            background: "#1c1c1c",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-2">
            <div className="h-3 rounded-full bg-[#2a2a2a]" />
          </div>
          <div className="relative w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center">
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: "#ff5b1f" }}
            />
            <Icon icon="mdi:puzzle" width={11} height={11} color="#999" />
          </div>
        </div>
        <div className="relative aspect-[3/4] bg-[#f5f5f5]">
          <Image
            src={src}
            alt={label}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </motion.div>
      <div>
        <div
          className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1"
          style={{ color: "#ff5b1f" }}
        >
          {num} · {label}
        </div>
        <p style={{ color: "#b8b4a8", fontSize: 13, lineHeight: 1.5 }}>
          {description}
        </p>
      </div>
    </motion.button>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

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
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(7, 8, 10, 0.85)", backdropFilter: "blur(12px)" }}
      />
      <motion.div
        className="relative z-10 max-w-2xl w-full mx-6 overflow-hidden"
        style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.8)" }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{
            background: "#1c1c1c",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-3">
            <div className="h-5 rounded-md bg-[#2a2a2a] max-w-[200px] mx-auto" />
          </div>
        </div>
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="Full" className="w-full h-auto block" />
        </div>
      </motion.div>
      <p
        className="absolute bottom-8 font-mono text-[10px] tracking-[0.22em] uppercase"
        style={{ color: "#6e6b62" }}
      >
        Click anywhere to close
      </p>
    </motion.div>
  );
}
