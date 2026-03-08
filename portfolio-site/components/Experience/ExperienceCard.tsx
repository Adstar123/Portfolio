"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import type { WorkExperience } from "@/lib/data";

interface ExperienceCardProps {
  experience: WorkExperience;
  index: number;
  side: "left" | "right";
}

export default function ExperienceCard({
  experience,
  index,
  side,
}: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      const spot = spotlightRef.current;
      if (!card || !spot) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rotateY = ((mouseX - centerX) / centerX) * 5;
      const rotateX = -((mouseY - centerY) / centerY) * 5;

      const spotlightX = (mouseX / rect.width) * 100;
      const spotlightY = (mouseY / rect.height) * 100;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      spot.style.background = `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(245,158,11,0.08) 0%, transparent 60%)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  }, []);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: side === "left" ? -80 : 80,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 20,
        delay: index * 0.2,
      }}
    >
      <div
        style={{ perspective: "1000px" }}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-2 rounded-2xl blur-xl transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent 70%)",
            opacity: isHovered ? 0.15 : 0,
          }}
        />

        {/* Gradient border */}
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

        {/* Card body */}
        <div
          ref={cardRef}
          className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transition: isHovered
              ? "transform 0.1s ease-out"
              : "transform 0.5s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Spotlight overlay */}
          <div
            ref={spotlightRef}
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-accent-amber/10 border border-accent-amber/20">
                <Icon
                  icon={experience.companyIcon}
                  width={24}
                  height={24}
                  className="text-accent-amber"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl md:text-2xl font-normal text-text-primary">
                  {experience.company}
                </h3>
                <p className="font-body text-accent-amber text-sm font-medium mt-0.5">
                  {experience.role}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="font-mono text-xs text-text-secondary">
                    {experience.period}
                  </span>
                  <span className="text-text-secondary/30 hidden sm:inline">|</span>
                  <span className="font-mono text-xs text-text-secondary hidden sm:inline">
                    {experience.location}
                  </span>
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border"
                    style={{
                      borderColor:
                        experience.type === "full-time"
                          ? "rgba(245, 158, 11, 0.3)"
                          : "rgba(251, 191, 36, 0.3)",
                      color:
                        experience.type === "full-time"
                          ? "#f59e0b"
                          : "#fbbf24",
                      background:
                        experience.type === "full-time"
                          ? "rgba(245, 158, 11, 0.08)"
                          : "rgba(251, 191, 36, 0.08)",
                    }}
                  >
                    {experience.type === "full-time" ? "Full-time" : "Internship"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description bullets */}
            <div className="space-y-3 mb-6">
              {experience.description.map((bullet, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex gap-3"
                >
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-amber/60 flex-shrink-0" />
                  <p className="font-body text-sm leading-relaxed text-text-secondary">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-2">
              {experience.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-mono rounded-full bg-background border border-white/5 text-text-secondary transition-all duration-200 hover:border-accent-amber/30 hover:text-accent-amber hover:shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
