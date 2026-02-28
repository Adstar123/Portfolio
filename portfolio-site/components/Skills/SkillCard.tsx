"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import * as LucideIcons from "lucide-react";
import type { Skill } from "@/lib/data";

interface SkillCardProps {
  skill: Skill;
  colour: string;
  index: number;
  isFiltered: boolean;
  magnetOffset: { x: number; y: number };
}

export default function SkillCard({
  skill,
  colour,
  index,
  isFiltered,
  magnetOffset,
}: SkillCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  // Deterministic "random" scatter based on index
  const seed = ((index * 7 + 13) % 17) / 17;
  const rotation = (seed - 0.5) * 4; // -2 to +2 degrees
  const yOffset = ((index * 11 + 3) % 13) - 6; // -6 to +6px

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }

  // 3D tilt from mouse position
  const tiltX = isHovered ? (mousePos.y - 0.5) * -10 : 0;
  const tiltY = isHovered ? (mousePos.x - 0.5) * 10 : 0;

  // Get Lucide icon component dynamically
  const LucideIcon =
    skill.iconType === "lucide"
      ? (LucideIcons as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
          skill.icon.charAt(0).toUpperCase() + skill.icon.slice(1)
        ] ?? LucideIcons.CircleDot
      : null;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0.5, y: 0.5 });
      }}
      initial={{ scale: 0, rotate: rotation + 10 }}
      whileInView={{ scale: 1, rotate: rotation }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
        delay: index * 0.03,
      }}
      animate={{
        opacity: isFiltered ? 0.1 : 1,
        scale: isFiltered ? 0.85 : 1,
        x: isFiltered ? (seed - 0.5) * 40 : magnetOffset.x,
        y: isFiltered ? yOffset * 3 : yOffset + magnetOffset.y,
        rotate: isHovered ? 0 : rotation,
        translateY: isHovered ? -8 : 0,
        filter: isFiltered ? "grayscale(1)" : "grayscale(0)",
      }}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="relative cursor-pointer select-none"
    >
      <div
        className="relative overflow-hidden rounded-xl p-4 flex flex-col items-center gap-3 w-[100px] h-[110px]"
        style={{
          background: "rgba(18, 18, 26, 0.6)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${isHovered ? `${colour}60` : "rgba(255,255,255,0.05)"}`,
          borderLeft: `2px solid ${isHovered ? colour : `${colour}30`}`,
          boxShadow: isHovered
            ? `0 0 20px ${colour}20, 0 0 40px ${colour}10, 0 8px 32px rgba(0,0,0,0.4)`
            : "0 4px 16px rgba(0,0,0,0.2)",
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: "border-color 0.2s, border-left-color 0.2s, box-shadow 0.3s, transform 0.15s ease-out",
        }}
      >
        {/* Cursor-following spotlight */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle 80px at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${colour}15, transparent)`,
            }}
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
            color: isHovered ? colour : "#94a3b8",
            transition: "color 0.2s",
          }}
        >
          {skill.name}
        </span>
      </div>
    </motion.div>
  );
}
