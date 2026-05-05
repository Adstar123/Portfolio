"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Icon } from "@iconify/react";
import { skillCategories, type Skill } from "@/lib/data";

type FlatSkill = Skill & { categoryName: string };

const ALL_KEY = "all";

export default function SkillsSection() {
  const [filter, setFilter] = useState<string>(ALL_KEY);
  const gridRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Smooth cursor-following spotlight on the grid using rAF + lerp.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const grid = gridRef.current;
    const spot = spotlightRef.current;
    if (!grid || !spot) return;

    let mx = 0;
    let my = 0;
    let cx = 0;
    let cy = 0;
    let active = false;
    let raf = 0;

    function tick() {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      if (spot) {
        spot.style.transform = `translate3d(${cx - 200}px, ${cy - 200}px, 0)`;
        spot.style.opacity = active ? "1" : "0";
      }
      raf = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      const rect = grid!.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
      if (!active) {
        cx = mx;
        cy = my;
      }
      active = true;
    }

    function onLeave() {
      active = false;
    }

    grid.addEventListener("pointermove", onMove);
    grid.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);
    return () => {
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const flat: FlatSkill[] = useMemo(() => {
    return skillCategories.flatMap((cat) =>
      cat.skills.map((s) => ({ ...s, categoryName: cat.name }))
    );
  }, []);

  const filtered = useMemo(() => {
    if (filter === ALL_KEY) return flat;
    return flat.filter((s) => s.categoryName === filter);
  }, [flat, filter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { [ALL_KEY]: flat.length };
    skillCategories.forEach((cat) => {
      map[cat.name] = cat.skills.length;
    });
    return map;
  }, [flat]);

  return (
    <section
      id="skills"
      className="relative z-[10] py-[120px] md:py-[160px] px-[var(--pad)]"
    >
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-12 gap-x-8 mb-12 pb-10 border-b"
          style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
        >
          <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              003 / Toolkit
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(48px, 8vw, 120px)",
                fontWeight: 500,
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
              }}
            >
              The{" "}
              <span
                className="font-serif italic"
                style={{ color: "#ff5b1f", fontWeight: 400 }}
              >
                toolkit.
              </span>
            </h2>
          </div>
        </motion.div>

        {/* Filter strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap gap-0 mb-10"
          style={{
            borderTop: "1px solid rgba(242, 239, 232, 0.14)",
            borderBottom: "1px solid rgba(242, 239, 232, 0.14)",
          }}
        >
          <FilterButton
            label="All"
            value={ALL_KEY}
            count={counts[ALL_KEY]}
            active={filter === ALL_KEY}
            onClick={() => setFilter(ALL_KEY)}
          />
          {skillCategories.map((cat) => (
            <FilterButton
              key={cat.name}
              label={cat.name}
              value={cat.name}
              count={counts[cat.name]}
              active={filter === cat.name}
              onClick={() => setFilter(cat.name)}
            />
          ))}
        </motion.div>

        {/* Grid with cursor spotlight */}
        <LayoutGroup>
        <motion.div
          ref={gridRef}
          layout
          className="relative grid gap-px overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            background: "rgba(242, 239, 232, 0.06)",
            border: "1px solid rgba(242, 239, 232, 0.06)",
          }}
          transition={{
            layout: {
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
        >
          {/* Cursor-following spotlight */}
          <div
            ref={spotlightRef}
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              top: 0,
              left: 0,
              width: 400,
              height: 400,
              background:
                "radial-gradient(circle at center, rgba(255, 91, 31, 0.22) 0%, rgba(255, 91, 31, 0.10) 30%, transparent 65%)",
              opacity: 0,
              transition: "opacity 0.25s ease",
              mixBlendMode: "screen",
              zIndex: 5,
            }}
          />
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((skill, i) => (
              <motion.div
                key={`${skill.categoryName}-${skill.name}`}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{
                  layout: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                  opacity: { duration: 0.25 },
                  scale: { duration: 0.25 },
                }}
                className="group relative aspect-[5/4] p-4 flex flex-col justify-between transition-colors"
                style={{ background: "#07080a" }}
                whileHover={{
                  background: "#f2efe8",
                  transition: { duration: 0.2 },
                }}
              >
                {/* Top — index */}
                <span
                  className="font-mono text-[10px] tracking-[0.08em] uppercase opacity-60 group-hover:opacity-100 transition-colors"
                  style={{ color: "#6e6b62" }}
                >
                  {String(i + 1).padStart(3, "0")}
                </span>

                {/* Middle — icon */}
                <div className="flex items-center justify-center flex-1 py-2">
                  <SkillIcon skill={skill} />
                </div>

                {/* Bottom — name + cat */}
                <div className="flex flex-col gap-[2px]">
                  <span
                    className="font-display text-[13px] leading-[1.1] transition-colors"
                    style={{ color: "#f2efe8", fontWeight: 500 }}
                  >
                    {skill.name}
                  </span>
                  <span
                    className="font-mono text-[9px] tracking-[0.12em] uppercase transition-colors"
                    style={{ color: "#6e6b62" }}
                  >
                    {skill.categoryName}
                  </span>
                </div>

                <style jsx>{`
                  div:hover :global(span.font-display) {
                    color: #07080a !important;
                  }
                  div:hover :global(span.font-mono) {
                    color: #d24513 !important;
                  }
                `}</style>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}

function FilterButton({
  label,
  value,
  count,
  active,
  onClick,
}: {
  label: string;
  value: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="filter-chip group px-5 py-4 font-mono text-[11px] tracking-[0.18em] uppercase relative cursor-pointer"
      style={{
        color: active ? "#07080a" : "#b8b4a8",
        background: active ? "#f2efe8" : "transparent",
        borderRight: "1px solid rgba(242, 239, 232, 0.06)",
        transition: "color 0.2s ease, background-color 0.2s ease",
      }}
      aria-pressed={active}
    >
      {/* Hover underline */}
      {!active && (
        <span
          aria-hidden
          className="absolute left-3 right-3 bottom-1 h-[1px] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
          style={{ background: "#ff5b1f" }}
        />
      )}
      {label}
      <span
        className="ml-2 text-[10px]"
        style={{ color: active ? "#d24513" : "#6e6b62" }}
      >
        {count}
      </span>
      <style jsx>{`
        .filter-chip:hover {
          color: ${active ? "#07080a" : "#f2efe8"};
        }
      `}</style>
    </button>
  );
}

function SkillIcon({ skill }: { skill: FlatSkill }) {
  if (skill.iconType === "iconify") {
    return (
      <Icon
        icon={skill.icon}
        width={42}
        height={42}
        className="transition-transform group-hover:scale-110"
        style={{ color: "#f2efe8" }}
      />
    );
  }
  // Fallback for lucide names — render their iconify equivalent
  return (
    <Icon
      icon={`lucide:${skill.icon}`}
      width={36}
      height={36}
      className="transition-transform group-hover:scale-110"
      style={{ color: "#ff5b1f" }}
    />
  );
}
