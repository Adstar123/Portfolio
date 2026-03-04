"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import * as LucideIcons from "lucide-react";
import type { Skill } from "@/lib/data";

interface SkillCardProps {
  skill: Skill;
  colour: string;
  index: number;
  isFiltered: boolean;
}

export default function SkillCard({
  skill,
  colour,
  index,
  isFiltered,
}: SkillCardProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Deterministic "random" scatter based on index
  const seed = ((index * 7 + 13) % 17) / 17;
  const rotation = (seed - 0.5) * 4; // -2 to +2 degrees
  const yOffset = ((index * 11 + 3) % 13) - 6; // -6 to +6px

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const inner = innerRef.current;
      const spot = spotlightRef.current;
      if (!inner) return;
      const rect = inner.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;

      const tiltX = (my - 0.5) * -10;
      const tiltY = (mx - 0.5) * 10;
      inner.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;

      if (spot) {
        spot.style.background = `radial-gradient(circle 80px at ${mx * 100}% ${my * 100}%, ${colour}15, transparent)`;
      }
    },
    [colour]
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (innerRef.current) {
      innerRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  }, []);

  // Get Lucide icon component dynamically
  const LucideIcon =
    skill.iconType === "lucide"
      ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
          skill.icon.charAt(0).toUpperCase() + skill.icon.slice(1)
        ] ?? LucideIcons.CircleDot
      : null;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={{
        scale: 0,
        rotate: rotation + (index % 2 === 0 ? -15 : 15),
        x: index % 2 === 0 ? -200 : 200,
        opacity: 0,
      }}
      whileInView={{
        scale: 1,
        rotate: rotation,
        x: 0,
        opacity: 1,
      }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: index * 0.03,
      }}
      animate={{
        opacity: isFiltered ? 0.1 : 1,
        scale: isFiltered ? 0.9 : 1,
        x: 0,
        y: isFiltered ? 0 : yOffset,
        rotate: isFiltered ? 0 : isHovered ? 0 : rotation,
        translateY: isHovered && !isFiltered ? -8 : 0,
      }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
        filter: isFiltered ? "grayscale(1)" : "grayscale(0)",
        transition: "filter 0.3s ease",
        pointerEvents: isFiltered ? "none" : "auto",
      }}
      className="relative cursor-pointer select-none"
    >
      <div
        ref={innerRef}
        className="relative overflow-hidden rounded-xl p-4 flex flex-col items-center gap-3 w-[100px] h-[110px] grain"
        style={{
          background: "rgba(20, 20, 20, 0.8)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${isFiltered ? "#1a1a1a" : isHovered ? `${colour}60` : "#262626"}`,
          borderLeft: `2px solid ${isFiltered ? "#1a1a1a" : isHovered ? colour : `${colour}30`}`,
          boxShadow: isFiltered
            ? "none"
            : isHovered
              ? `0 0 20px ${colour}20, 0 0 40px ${colour}10, 0 8px 32px rgba(0,0,0,0.4)`
              : "0 4px 16px rgba(0,0,0,0.2)",
          transition: "border-color 0.2s, border-left-color 0.2s, box-shadow 0.3s, transform 0.15s ease-out",
        }}
      >
        {/* Cursor-following spotlight */}
        {isHovered && (
          <div
            ref={spotlightRef}
            className="absolute inset-0 pointer-events-none"
          />
        )}

        {/* Icon */}
        <div className="relative z-10 w-12 h-12 flex items-center justify-center">
          {skill.iconType === "iconify" ? (
            <Icon icon={skill.icon} width={48} height={48} />
          ) : LucideIcon ? (
            <LucideIcon size={40} className="text-text-secondary" />
          ) : null}
        </div>

        {/* Name */}
        <span
          className="relative z-10 font-mono text-xs text-center leading-tight"
          style={{
            color: isHovered ? colour : "#a3a3a3",
            transition: "color 0.2s",
          }}
        >
          {skill.name}
        </span>
      </div>
    </motion.div>
  );
}
