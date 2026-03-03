"use client";

import { motion, AnimatePresence } from "motion/react";
import { X, Github, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/data";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <AnimatePresence>
      {project && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            key="modal"
            className="fixed inset-4 z-50 rounded-2xl bg-surface border border-white/5 overflow-y-auto max-h-[90vh] md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full md:inset-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>

            {/* Content */}
            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold text-text-primary">
                {project.title}
              </h2>

              <p className="font-body text-lg text-text-secondary mb-8">
                {project.tagline}
              </p>

              {/* Description paragraphs */}
              <div className="space-y-4 mb-8">
                {project.description.map((paragraph, i) => (
                  <motion.p
                    key={i}
                    className="font-body text-text-secondary leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {/* Tech Stack */}
              <h3 className="text-sm uppercase tracking-widest text-text-secondary/60 mb-3">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2 mb-8">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-4 py-2 text-sm font-mono rounded-full bg-background border border-white/5 text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Explore Full Project Button */}
              {project.route && (
                <Link
                  href={project.route}
                  className="flex items-center justify-center gap-3 w-full py-4 mb-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display uppercase tracking-wider font-medium text-base hover:scale-[1.02] transition-all"
                >
                  {project.routeLabel || "Explore Full Project"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-4">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-amber hover:bg-accent-amber-hover text-black font-display uppercase tracking-wider font-medium text-sm hover:scale-105 transition-all"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-text-secondary font-display uppercase tracking-wider font-medium text-sm hover:bg-white/5 hover:text-text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
