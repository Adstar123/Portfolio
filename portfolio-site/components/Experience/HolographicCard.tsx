"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { Icon } from "@iconify/react";
import type { WorkExperience } from "@/lib/data";

interface HolographicCardProps {
  experience: WorkExperience;
  index: number;
  onSelect: () => void;
}

export default function HolographicCard({
  experience,
  index,
  onSelect,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to card centre (range: -0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoothed 3D rotation with spring physics
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [12, -12]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-12, 12]),
    springConfig
  );

  // Holographic shine position (0-100%)
  const shineX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  // Dynamic shadow offset
  const shadowX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [15, -15]),
    springConfig
  );
  const shadowY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [15, -15]),
    springConfig
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  // Mobile: device orientation for subtle tilt
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = (e.gamma ?? 0) / 45;
      const beta = ((e.beta ?? 0) - 45) / 45;
      mouseX.set(gamma * 0.3);
      mouseY.set(beta * 0.3);
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [mouseX, mouseY]);

  // Build dynamic box-shadow string
  const boxShadow = useTransform(
    [shadowX, shadowY],
    ([sx, sy]: number[]) =>
      isHovered
        ? `${sx}px ${sy}px 40px rgba(245, 158, 11, 0.15), 0 0 80px rgba(245, 158, 11, 0.08)`
        : "0px 4px 20px rgba(0, 0, 0, 0.3)"
  );

  // Build holographic radial gradient from mouse position
  const shineGradient = useTransform(
    [shineX, shineY],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.06) 40%, transparent 70%)`
  );

  // Prismatic iridescent gradient
  const prismaticGradient = useTransform(
    shineX,
    (x: number) =>
      `linear-gradient(${x * 3.6}deg, rgba(255,120,50,0.08), rgba(245,158,11,0.12), rgba(251,191,36,0.08), rgba(239,68,68,0.06), rgba(245,158,11,0.1))`
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        ref={cardRef}
        className="relative cursor-pointer"
        style={{ perspective: 800 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onSelect}
        animate={{ y: [0, -4, 0] }}
        transition={{
          y: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.7,
          },
        }}
      >
        <motion.div
          className="relative rounded-2xl overflow-hidden"
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            boxShadow,
          }}
        >
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl holographic-border" />

          {/* Card inner background */}
          <div className="relative m-[1.5px] rounded-2xl bg-[#0c0c0c]/95 backdrop-blur-xl p-7 md:p-8">
            {/* Holographic shine overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
              style={{
                background: shineGradient,
                opacity: isHovered ? 1 : 0,
              }}
            />

            {/* Mobile auto-shimmer fallback */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none md:hidden"
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(245, 158, 11, 0.08) 45%, rgba(251, 191, 36, 0.05) 50%, transparent 65%)",
                backgroundSize: "200% 100%",
                animation: "holographic-shimmer 3s ease-in-out infinite",
              }}
            />

            {/* Prismatic iridescent overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-overlay transition-opacity duration-500"
              style={{
                background: prismaticGradient,
                opacity: isHovered ? 0.6 : 0,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Company header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent-amber/10 border border-accent-amber/20">
                  <Icon
                    icon={experience.companyIcon}
                    width={28}
                    height={28}
                    className="text-accent-amber"
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl text-text-primary tracking-wide">
                    {experience.company}
                  </h3>
                  <p className="font-body text-accent-amber font-medium text-sm md:text-base">
                    {experience.role}
                  </p>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-5">
                <span className="font-mono text-xs md:text-sm text-text-secondary">
                  {experience.period}
                </span>
                <span className="text-text-secondary/30">|</span>
                <span className="font-mono text-xs md:text-sm text-text-secondary">
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
              </div>

              {/* Brief description preview */}
              <p className="font-body text-sm text-text-secondary/70 line-clamp-2 mb-5">
                {experience.description[0]}
              </p>

              {/* Tech stack preview — first 4 */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {experience.techStack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-[10px] font-mono rounded-full border border-white/10 text-text-secondary"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    {tech}
                  </span>
                ))}
                {experience.techStack.length > 4 && (
                  <span className="px-2.5 py-1 text-[10px] font-mono rounded-full border border-white/10 text-text-secondary/50">
                    +{experience.techStack.length - 4}
                  </span>
                )}
              </div>

              {/* Shimmer hint */}
              <div className="flex items-center gap-2 text-text-secondary/40 text-xs font-mono">
                <motion.span
                  className="inline-block h-px w-6"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.5), transparent)",
                    backgroundSize: "200% 100%",
                    animation: "holographic-shimmer 2s ease-in-out infinite",
                  }}
                />
                Click to explore
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
