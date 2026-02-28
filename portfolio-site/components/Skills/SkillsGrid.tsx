"use client";

import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import * as LucideIcons from "lucide-react";
import { skillCategories } from "@/lib/data";

export default function SkillsGrid() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 px-6">
      {skillCategories.map((category, catIndex) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: catIndex * 0.15,
            ease: "easeOut",
          }}
        >
          <h3
            className="font-heading text-lg font-semibold mb-4"
            style={{ color: category.colour }}
          >
            {category.name}
          </h3>

          <div className="flex flex-wrap gap-3">
            {category.skills.map((skill, skillIndex) => {
              const LucideIcon =
                skill.iconType === "lucide"
                  ? (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; className?: string }>>)[
                      skill.icon.charAt(0).toUpperCase() + skill.icon.slice(1)
                    ] ?? LucideIcons.CircleDot
                  : null;

              return (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.3,
                    delay: catIndex * 0.15 + skillIndex * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface border border-white/5 text-sm text-text-secondary cursor-default transition-shadow duration-200 hover:glow-gradient"
                >
                  {skill.iconType === "iconify" ? (
                    <Icon icon={skill.icon} width={20} height={20} />
                  ) : LucideIcon ? (
                    <LucideIcon size={16} className="text-text-secondary" />
                  ) : null}
                  <span>{skill.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
