"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import CategoryTabs from "./CategoryTabs";
import SkillCard from "./SkillCard";
import { skillCategories, type Skill } from "@/lib/data";

interface FlatSkill extends Skill {
  category: string;
  colour: string;
  flatIndex: number;
}

export default function SkillCardGalaxy() {
  const [activeCategory, setActiveCategory] = useState("All");
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);

  // Flatten all skills with their category info
  const allSkills: FlatSkill[] = useMemo(() => {
    const flat: FlatSkill[] = [];
    let idx = 0;
    for (const cat of skillCategories) {
      for (const skill of cat.skills) {
        flat.push({
          ...skill,
          category: cat.name,
          colour: cat.colour,
          flatIndex: idx++,
        });
      }
    }
    return flat;
  }, []);

  // Magnetic cursor effect — strong pull with quadratic falloff
  const MAGNET_RADIUS = 280;
  const MAGNET_STRENGTH = 18;

  const updateMagnets = useCallback(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>("[data-skill-card]");

    cards.forEach((card) => {
      // Skip filtered-out cards
      if (card.dataset.filtered === "true") {
        card.style.translate = "0px 0px";
        return;
      }

      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mouseRef.current.x - cx;
      const dy = mouseRef.current.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAGNET_RADIUS && dist > 1) {
        const t = 1 - dist / MAGNET_RADIUS;
        const force = t * t * MAGNET_STRENGTH;
        card.style.translate = `${(dx / dist) * force}px ${(dy / dist) * force}px`;
      } else {
        card.style.translate = "0px 0px";
      }
    });
  }, []);

  useEffect(() => {
    let rafId: number;

    function onMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }

    function loop() {
      if (isVisibleRef.current) {
        updateMagnets();
      }
      rafId = requestAnimationFrame(loop);
    }

    // Only run the magnet effect when the skills section is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("mousemove", onMouseMove);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [updateMagnets]);

  return (
    <div className="relative">
      {/* Large feathered radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-25%",
          left: "-10%",
          width: "120%",
          height: "150%",
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.03) 30%, transparent 70%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          animation: "gentle-pulse 4s ease-in-out infinite",
        }}
      />

      {/* Category tabs */}
      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      {/* Card grid */}
      <div
        ref={containerRef}
        className="relative flex flex-wrap justify-center gap-4 max-w-4xl mx-auto"
      >
        {allSkills.map((skill, i) => {
          const isFiltered =
            activeCategory !== "All" && skill.category !== activeCategory;

          return (
            <div
              key={skill.name}
              data-skill-card
              data-filtered={isFiltered ? "true" : "false"}
              style={{ transition: "translate 0.08s ease-out" }}
            >
              <SkillCard
                skill={skill}
                colour={skill.colour}
                index={skill.flatIndex}
                isFiltered={isFiltered}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
