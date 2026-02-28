"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { skillCategories } from "@/lib/data";

const RADII = [100, 170, 240, 310];
const SPEEDS = [30, -40, 35, -45];

function abbreviate(name: string): string {
  // Special cases for well-known abbreviations
  const map: Record<string, string> = {
    "TypeScript": "TS",
    "JavaScript": "JS",
    "HTML/CSS": "H/C",
    "Next.js": "Nxt",
    "Tailwind": "TW",
    "Electron": "Elc",
    "Figma": "Fig",
    "Node.js": "Nde",
    "Flask": "Flk",
    "PostgreSQL": "PgS",
    "Prisma": "Prs",
    "REST APIs": "API",
    "PyTorch": "PyT",
    "Docker": "Dkr",
    "Kubernetes": "K8s",
    "Terraform": "TF",
    "CI/CD": "CI",
    "Python": "Py",
    "GCloud": "GCP",
    "Azure": "Az",
  };
  if (map[name]) return map[name];
  return name.slice(0, 3);
}

export default function OrbitalRings() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [pausedRing, setPausedRing] = useState<number | null>(null);

  return (
    <div className="w-[700px] h-[700px] mx-auto relative">
      {/* Central hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full flex items-center justify-center glow-gradient"
        style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #06b6d4)",
        }}
      >
        <span className="font-heading text-lg font-bold text-white">AJ</span>
      </motion.div>

      {/* Orbital rings */}
      {skillCategories.map((category, ringIndex) => {
        const radius = RADII[ringIndex];
        const speed = SPEEDS[ringIndex];
        const isNegative = speed < 0;
        const duration = Math.abs(speed);

        return (
          <motion.div
            key={category.name}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: ringIndex * 0.15,
            }}
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              marginLeft: `${-radius}px`,
              marginTop: `${-radius}px`,
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
            }}
          >
            {/* Faint circle border */}
            <div
              className="absolute inset-0 rounded-full border border-white/[0.06]"
            />

            {/* Category label */}
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + ringIndex * 0.2, duration: 0.8 }}
              className="absolute text-xs text-text-secondary/50 uppercase tracking-widest font-mono whitespace-nowrap"
              style={{
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {category.name}
            </motion.span>

            {/* Rotating container */}
            <div
              className="absolute inset-0"
              style={{
                animation: `spin ${duration}s linear infinite${isNegative ? " reverse" : ""}`,
                animationPlayState:
                  pausedRing === ringIndex ? "paused" : "running",
              }}
            >
              {/* Skill icons */}
              {category.skills.map((skill, i) => {
                const total = category.skills.length;
                const angle = (i / total) * 2 * Math.PI;
                const x = Math.cos(angle) * radius + radius;
                const y = Math.sin(angle) * radius + radius;
                const isHovered = hoveredSkill === skill;

                return (
                  <div
                    key={skill}
                    className="absolute"
                    style={{
                      left: `${Math.round(x - 20)}px`,
                      top: `${Math.round(y - 20)}px`,
                    }}
                  >
                    {/* Counter-rotation to keep icons upright */}
                    <div
                      style={{
                        animation: `counter-spin ${duration}s linear infinite${isNegative ? " reverse" : ""}`,
                        animationPlayState:
                          pausedRing === ringIndex ? "paused" : "running",
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.4 }}
                        onMouseEnter={() => {
                          setHoveredSkill(skill);
                          setPausedRing(ringIndex);
                        }}
                        onMouseLeave={() => {
                          setHoveredSkill(null);
                          setPausedRing(null);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                          isHovered
                            ? "bg-surface-light text-text-primary glow-gradient"
                            : "bg-surface text-text-secondary"
                        }`}
                      >
                        <span className="font-mono text-xs select-none">
                          {abbreviate(skill)}
                        </span>
                      </motion.div>

                      {/* Tooltip */}
                      {isHovered && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-20">
                          <div className="glass rounded-lg px-3 py-1.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-text-primary">
                              {skill}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
