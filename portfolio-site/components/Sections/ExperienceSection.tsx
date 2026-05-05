"use client";

import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import { workExperience } from "@/lib/data";

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="relative z-[10] py-[120px] md:py-[160px] px-[var(--pad)]"
    >
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-12 gap-x-8 mb-16 pb-10 border-b"
          style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
        >
          <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              002 / Track Record
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
                track record.
              </span>
            </h2>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {workExperience.map((xp, i) => (
            <motion.article
              key={xp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-7 lg:p-8 flex flex-col gap-5 transition-colors"
              style={{
                border: "1px solid rgba(242, 239, 232, 0.14)",
                background: "rgba(12, 14, 18, 0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
              data-cursor-hover
              whileHover={{
                borderColor: "rgba(255, 91, 31, 0.5)",
                y: -4,
                transition: { duration: 0.3 },
              }}
            >
              {/* Top: when + company icon */}
              <div className="flex items-start justify-between">
                <div
                  className="font-mono text-[11px] tracking-[0.18em] uppercase"
                  style={{ color: "#ff5b1f" }}
                >
                  {xp.period}
                </div>
                <Icon
                  icon={xp.companyIcon}
                  width={20}
                  height={20}
                  style={{ color: "#b8b4a8" }}
                />
              </div>

              {/* Role + company */}
              <div className="flex flex-col gap-2">
                <h3
                  className="font-display"
                  style={{
                    fontSize: "clamp(22px, 2vw, 28px)",
                    fontWeight: 500,
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                    color: "#f2efe8",
                  }}
                >
                  {xp.role.split(" ").map((word, idx) =>
                    idx === 0 ? (
                      <span
                        key={idx}
                        className="font-serif italic"
                        style={{ color: "#ff5b1f", fontWeight: 400 }}
                      >
                        {word}{" "}
                      </span>
                    ) : (
                      <span key={idx}>{word} </span>
                    )
                  )}
                </h3>
                <div
                  className="font-mono text-[11px] tracking-[0.12em]"
                  style={{ color: "#6e6b62" }}
                >
                  {xp.company} · {xp.location}
                </div>
              </div>

              {/* Bullets */}
              <ul className="flex flex-col gap-2 flex-1">
                {xp.description.slice(0, 3).map((d, idx) => (
                  <li
                    key={idx}
                    className="relative pl-5 text-[14px] leading-[1.55]"
                    style={{ color: "#b8b4a8" }}
                  >
                    <span
                      className="absolute left-0 top-0"
                      style={{ color: "#ff5b1f" }}
                    >
                      ◦
                    </span>
                    {/* Trim long descriptions to ~2 sentences */}
                    {trimSentences(d, 1)}
                  </li>
                ))}
              </ul>

              {/* Stats (if any) */}
              {xp.stats && xp.stats.length > 0 && (
                <div
                  className="grid grid-cols-3 gap-3 pt-4"
                  style={{ borderTop: "1px solid rgba(242, 239, 232, 0.06)" }}
                >
                  {xp.stats.map((s, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                      <span
                        className="font-display"
                        style={{
                          fontSize: 18,
                          fontWeight: 500,
                          color: "#f2efe8",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        className="font-mono text-[9px] tracking-[0.14em] uppercase"
                        style={{ color: "#6e6b62" }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stack chips */}
              <div className="flex flex-wrap gap-1.5">
                {xp.techStack.slice(0, 6).map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] tracking-[0.06em] uppercase px-2 py-[3px] border"
                    style={{
                      borderColor: "rgba(242, 239, 232, 0.14)",
                      color: "#b8b4a8",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function trimSentences(text: string, maxSentences: number): string {
  const parts = text.split(/(?<=\.)\s+/);
  return parts.slice(0, maxSentences).join(" ");
}
