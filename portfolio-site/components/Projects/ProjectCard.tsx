"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import type { Project } from "@/lib/data";

interface ProjectCardProps {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}

const MAX_VISIBLE_TECH = 5;

export default function ProjectCard({
  project,
  index,
  onSelect,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rotateY = ((mouseX - centerX) / centerX) * 15;
      const rotateX = -((mouseY - centerY) / centerY) * 15;

      const spotlightX = (mouseX / rect.width) * 100;
      const spotlightY = (mouseY / rect.height) * 100;

      setTilt({ rotateX, rotateY });
      setSpotlight({ x: spotlightX, y: spotlightY });
    },
    []
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  const visibleTech = project.techStack.slice(0, MAX_VISIBLE_TECH);
  const remaining = project.techStack.length - MAX_VISIBLE_TECH;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
        delay: index * 0.2,
      }}
    >
      {/* Perspective wrapper */}
      <div
        style={{ perspective: "1000px" }}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-2 rounded-3xl blur-xl transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent 70%)",
            opacity: isHovered ? 0.15 : 0,
          }}
        />

        {/* Gradient glow border */}
        <div
          className="absolute -inset-px rounded-2xl transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(135deg, #f59e0b, #ef4444, #fbbf24)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 8s ease infinite",
            opacity: isHovered ? 1 : 0.3,
          }}
        />

        {/* Card */}
        <div
          ref={cardRef}
          onClick={() => onSelect(project)}
          className="relative rounded-2xl bg-surface p-8 min-h-[320px] overflow-hidden cursor-pointer flex flex-col"
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transition: isHovered
              ? "transform 0.1s ease-out"
              : "transform 0.5s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Spotlight overlay */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(245,158,11,0.08) 0%, transparent 60%)`,
              opacity: isHovered ? 1 : 0,
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col flex-1">
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {project.title}
            </h3>

            <p className="font-body text-text-secondary mb-6">
              {project.tagline}
            </p>

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {visibleTech.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-mono rounded-full bg-background border border-white/5 text-text-secondary"
                >
                  {tech}
                </span>
              ))}
              {remaining > 0 && (
                <span className="px-3 py-1 text-xs font-mono rounded-full bg-background border border-white/5 text-text-secondary">
                  +{remaining}
                </span>
              )}
            </div>

            {/* View project link */}
            <div className="mt-auto">
              <span className="gradient-text font-display uppercase tracking-wider text-sm font-medium">
                View Project &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
