"use client";

import { motion } from "motion/react";
import { bio } from "@/lib/data";

const SIDE_RAIL = [
  "Sydney, Australia",
  "NSW DCS · Software Engineer",
  "Macquarie · Hons SE + CySec",
  "Open to interesting work",
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-[10] py-[120px] md:py-[160px] px-[var(--pad)]"
    >
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Section index */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-12 gap-x-8 mb-16 md:mb-24 pb-10 border-b"
          style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
        >
          <div className="col-span-12 md:col-span-2 mb-6 md:mb-0">
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              001 / About
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(40px, 6vw, 88px)",
                fontWeight: 500,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                maxWidth: "20ch",
              }}
            >
              Hey. I&apos;m Adam, a{" "}
              <span
                className="font-serif italic"
                style={{ color: "#ff5b1f", fontWeight: 400 }}
              >
                software engineer
              </span>{" "}
              based in Sydney.
            </h2>
          </div>
        </motion.div>

        {/* Body grid */}
        <div className="grid grid-cols-12 gap-x-8 gap-y-12">
          {/* Side rail */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="col-span-12 md:col-span-3"
          >
            <ul
              className="font-mono text-[11px] tracking-[0.18em] uppercase space-y-3"
              style={{ color: "#b8b4a8" }}
            >
              {SIDE_RAIL.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span style={{ color: "#ff5b1f" }}>→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.aside>

          {/* Lead */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-12 md:col-span-5"
          >
            <p
              className="font-display"
              style={{
                fontSize: "clamp(22px, 2vw, 30px)",
                lineHeight: 1.3,
                letterSpacing: "-0.02em",
                color: "#f2efe8",
                fontWeight: 400,
                textWrap: "balance",
              }}
            >
              {bio.intro}
            </p>
          </motion.div>

          {/* Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="col-span-12 md:col-span-4 space-y-4"
            style={{ color: "#b8b4a8", fontSize: 15, lineHeight: 1.65 }}
          >
            <p>{bio.current}</p>
            <p>{bio.hobby}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
