"use client";

import { motion } from "motion/react";
import { skillCategories } from "@/lib/data";

const CATEGORIES = ["All", ...skillCategories.map((c) => c.name)];

interface CategoryTabsProps {
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-wrap justify-center gap-3 mb-12"
    >
      {CATEGORIES.map((cat, i) => {
        const isActive = active === cat;
        const colour =
          cat === "All"
            ? "#8b5cf6"
            : skillCategories.find((c) => c.name === cat)?.colour ?? "#8b5cf6";

        return (
          <motion.button
            key={cat}
            onClick={() => onChange(cat)}
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
            className="relative px-5 py-2 rounded-full font-mono text-sm transition-colors duration-200 cursor-pointer"
            style={{
              background: isActive ? `${colour}15` : "transparent",
              border: `1px solid ${isActive ? `${colour}40` : "rgba(255,255,255,0.05)"}`,
              color: isActive ? colour : "#94a3b8",
            }}
            whileHover={{
              scale: 1.05,
              borderColor: `${colour}60`,
            }}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
            {isActive && (
              <motion.div
                layoutId="category-underline"
                className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full"
                style={{ background: colour }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
