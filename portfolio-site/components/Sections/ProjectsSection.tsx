"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import OpenGTOTeaser from "@/components/Projects/OpenGTOTeaser";
import CopilotMock from "@/components/Projects/CopilotMock";

interface Stat {
  value: string;
  label: string;
}

interface ProjectBlock {
  num: string;
  title: string;
  italicWord: string;
  tagline: string;
  description: string;
  stats: Stat[];
  stack: string[];
  github?: string;
  route?: string;
  routeLabel?: string;
  Demo: React.ComponentType;
  align: "left" | "right";
}

const PROJECTS: ProjectBlock[] = [
  {
    num: "PRJ / 01",
    title: "Open",
    italicWord: "GTO",
    tagline:
      "Neural network-powered poker preflop trainer converging toward Nash equilibrium.",
    description:
      "Deep Counterfactual Regret Minimisation (Deep CFR) with three networks self-playing across 20K+ training iterations. 317-D feature vector, 8-stage curriculum learning, weighted reservoir sampling over 5M+ samples. Cross-platform Electron desktop app with interactive table, live GTO feedback, and a Range Viewer for all 169 starting hands.",
    stats: [
      { value: "20K+", label: "training iters" },
      { value: "5M+", label: "samples" },
      { value: "317-D", label: "feature space" },
      { value: "169", label: "hand ranges" },
    ],
    stack: ["PyTorch", "Deep CFR", "React", "Electron", "Flask", "ONNX"],
    github: "https://github.com/Adstar123/OpenGTO",
    route: "/projects/opengto",
    routeLabel: "Open full trainer",
    Demo: OpenGTOTeaser,
    align: "right",
  },
  {
    num: "PRJ / 02",
    title: "AI",
    italicWord: "Co-Pilot",
    tagline:
      "Chrome extension turning learning analytics into personalised recommendations.",
    description:
      "Honours thesis project. Reads quiz scores, engagement time, skipped lessons and link clicks from SCORM and Moodle, then surfaces personalised LLM-driven recommendations through a Chrome extension. Demonstrated lift in student engagement and module completion.",
    stats: [
      { value: "2", label: "LMS platforms" },
      { value: "+22%", label: "engagement" },
      { value: "Honours", label: "thesis" },
      { value: "4", label: "person team" },
    ],
    stack: [
      "JavaScript",
      "Chrome APIs",
      "SCORM",
      "Moodle",
      "LLM",
      "REST APIs",
    ],
    github: "https://github.com/mahit-c/Thesis-AI-Copilot",
    route: "/projects/ai-copilot",
    routeLabel: "View deep-dive",
    Demo: CopilotMock,
    align: "left",
  },
];

export default function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative z-[10] py-[120px] md:py-[160px] px-[var(--pad)]"
    >
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-12 gap-x-8 mb-16 pb-10 border-b"
          style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
        >
          <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              004 / The Work
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(48px, 8vw, 120px)",
                fontWeight: 500,
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
              }}
            >
              The{" "}
              <span
                className="font-serif italic"
                style={{ color: "#ff5b1f", fontWeight: 400 }}
              >
                work.
              </span>
            </h2>
          </div>
        </motion.div>

        {/* Project blocks */}
        <div className="flex flex-col gap-24 lg:gap-32">
          {PROJECTS.map((p, i) => (
            <ProjectBlockComponent key={p.num} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectBlockComponent({
  project,
  index,
}: {
  project: ProjectBlock;
  index: number;
}) {
  const Demo = project.Demo;
  const isLeft = project.align === "left";

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-10 items-stretch"
    >
      {/* Demo column */}
      <div
        className={`col-span-12 lg:col-span-7 ${
          isLeft ? "lg:order-1" : "lg:order-2"
        }`}
      >
        <div
          className="relative overflow-hidden h-full flex"
          style={{
            border: "1px solid rgba(242, 239, 232, 0.14)",
            background:
              "linear-gradient(135deg, rgba(255,91,31,0.05), rgba(12,14,18,0.55))",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            minHeight: 580,
          }}
        >
          <Demo />
        </div>
      </div>

      {/* Content column */}
      <div
        className={`col-span-12 lg:col-span-5 flex flex-col gap-6 ${
          isLeft ? "lg:order-2" : "lg:order-1"
        }`}
      >
        <div
          className="font-mono text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "#ff5b1f" }}
        >
          {project.num}
        </div>

        <h3
          className="font-display"
          style={{
            fontSize: "clamp(48px, 5vw, 80px)",
            fontWeight: 500,
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            color: "#f2efe8",
          }}
        >
          {project.title}
          <span
            className="font-serif italic"
            style={{ color: "#ff5b1f", fontWeight: 400 }}
          >
            {project.italicWord}
          </span>
          .
        </h3>

        <p
          className="font-serif italic"
          style={{
            fontSize: "clamp(18px, 1.6vw, 22px)",
            lineHeight: 1.35,
            color: "#b8b4a8",
            maxWidth: "26ch",
          }}
        >
          {project.tagline}
        </p>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.65,
            color: "#b8b4a8",
            maxWidth: "44ch",
          }}
        >
          {project.description}
        </p>

        {/* Stats */}
        <ul
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4"
          style={{
            borderTop: "1px solid rgba(242, 239, 232, 0.14)",
            borderBottom: "1px solid rgba(242, 239, 232, 0.14)",
          }}
        >
          {project.stats.map((s) => (
            <li key={s.label} className="flex flex-col gap-1">
              <span
                className="font-display"
                style={{
                  fontSize: 22,
                  fontWeight: 500,
                  color: "#f2efe8",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </span>
              <span
                className="font-mono text-[9px] tracking-[0.14em] uppercase"
                style={{ color: "#6e6b62" }}
              >
                {s.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Stack */}
        <div className="flex flex-wrap gap-1.5">
          {project.stack.map((t) => (
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

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          {project.route && (
            <Link
              href={project.route}
              data-cursor-hover
              className="inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-[0.16em] uppercase transition-colors"
              style={{
                background: "#ff5b1f",
                color: "#07080a",
                border: "1px solid #ff5b1f",
              }}
            >
              {project.routeLabel}
              <ArrowUpRight size={14} />
            </Link>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-[0.16em] uppercase transition-all"
              style={{
                background: "transparent",
                color: "#f2efe8",
                border: "1px solid rgba(242, 239, 232, 0.3)",
              }}
            >
              <Github size={14} />
              GitHub
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
