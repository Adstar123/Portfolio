"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Icon } from "@iconify/react";
import { workExperience } from "@/lib/data";
import type { WorkExperience } from "@/lib/data";
import HolographicCard from "./HolographicCard";
import AnimatedCounter from "./AnimatedCounter";

export default function ExperienceCards() {
  const [selected, setSelected] = useState<WorkExperience | null>(null);

  // Close on Escape key + lock body scroll
  useEffect(() => {
    if (!selected) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <section
      id="experience"
      className="relative py-24 md:py-32 px-6 bg-background overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] md:w-[800px] md:h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245, 158, 11, 0.04), transparent 70%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 md:mb-20 text-center"
        >
          <motion.h2
            initial={{ clipPath: "inset(-4px 100% -4px 0)" }}
            whileInView={{ clipPath: "inset(-4px 0% -4px 0)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display uppercase tracking-[0.12em] text-4xl md:text-5xl font-normal text-text-primary"
          >
            Experience
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-3 h-1 w-24 mx-auto origin-center rounded-full"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            }}
          />
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {workExperience.map((exp, i) => (
            <HolographicCard
              key={exp.id}
              experience={exp}
              index={i}
              onSelect={() => setSelected(exp)}
            />
          ))}
        </div>
      </div>

      {/* Expanded card overlay */}
      <AnimatePresence>
        {selected && (
          <ExpandedExperience experience={selected} onClose={handleClose} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ── Expanded experience modal ── */

interface ExpandedExperienceProps {
  experience: WorkExperience;
  onClose: () => void;
}

function ExpandedExperience({ experience, onClose }: ExpandedExperienceProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.2 },
    },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const bulletVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const techPillVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop with blur */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Expanded card */}
      <motion.div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10"
        style={{ background: "rgba(12, 12, 12, 0.98)" }}
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient glow inside card */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245, 158, 11, 0.06), transparent 70%)",
          }}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full border border-white/10 text-text-secondary hover:text-text-primary hover:border-accent-amber/30 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Content with staggered reveals */}
        <motion.div
          className="relative z-10 p-6 md:p-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header: company icon + name with clip-path wipe */}
          <motion.div
            className="flex items-center gap-4 mb-2"
            variants={itemVariants}
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center bg-accent-amber/10 border border-accent-amber/20">
              <Icon
                icon={experience.companyIcon}
                width={32}
                height={32}
                className="text-accent-amber"
              />
            </div>
            <motion.h3
              className="font-display uppercase tracking-[0.08em] text-3xl md:text-4xl lg:text-5xl font-normal text-text-primary"
              initial={{ clipPath: "inset(-4px 100% -4px 0)" }}
              animate={{ clipPath: "inset(-4px 0% -4px 0)" }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {experience.company}
            </motion.h3>
          </motion.div>

          {/* Role info */}
          <motion.div
            className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 ml-0 md:ml-20"
            variants={itemVariants}
          >
            <span className="font-body text-lg md:text-xl text-accent-amber font-medium">
              {experience.role}
            </span>
            <span className="font-mono text-sm text-text-secondary">
              {experience.period}
            </span>
            <span className="font-mono text-sm text-text-secondary hidden sm:inline">
              {experience.location}
            </span>
            <span
              className="px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border"
              style={{
                borderColor:
                  experience.type === "full-time"
                    ? "rgba(245, 158, 11, 0.3)"
                    : "rgba(251, 191, 36, 0.3)",
                color:
                  experience.type === "full-time" ? "#f59e0b" : "#fbbf24",
                background:
                  experience.type === "full-time"
                    ? "rgba(245, 158, 11, 0.08)"
                    : "rgba(251, 191, 36, 0.08)",
              }}
            >
              {experience.type === "full-time" ? "Full-time" : "Internship"}
            </span>
          </motion.div>

          {/* Gradient divider */}
          <motion.div
            className="h-px w-full max-w-md mb-8 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            style={{
              background:
                "linear-gradient(90deg, #f59e0b, #ef4444, transparent)",
            }}
          />

          {/* Description bullets — cascade from left */}
          <div className="space-y-4 mb-10 max-w-3xl">
            {experience.description.map((bullet, i) => (
              <motion.div
                key={i}
                className="flex gap-3"
                variants={bulletVariants}
              >
                <motion.span
                  className="mt-2 w-2 h-2 rounded-full bg-accent-amber flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 20,
                    delay: 0.5 + i * 0.08,
                  }}
                  style={{ boxShadow: "0 0 6px rgba(245, 158, 11, 0.5)" }}
                />
                <p className="font-body text-sm md:text-base leading-relaxed text-text-secondary">
                  {bullet}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Stats counters */}
          {experience.stats && experience.stats.length > 0 && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 mb-10"
              variants={itemVariants}
            >
              {experience.stats.map((stat, i) => (
                <AnimatedCounter
                  key={stat.label}
                  stat={stat}
                  delay={700 + i * 150}
                />
              ))}
            </motion.div>
          )}

          {/* Tech stack pills — float up with spring */}
          <motion.div
            className="flex flex-wrap justify-center gap-2"
            variants={containerVariants}
          >
            {experience.techStack.map((tech) => (
              <motion.span
                key={tech}
                className="px-4 py-1.5 text-xs font-mono rounded-full border border-white/10 text-text-secondary transition-all duration-200 hover:border-accent-amber/30 hover:text-accent-amber hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                style={{ background: "rgba(255,255,255,0.03)" }}
                variants={techPillVariants}
              >
                {tech}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
