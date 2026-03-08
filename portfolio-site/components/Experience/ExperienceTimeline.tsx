"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { workExperience } from "@/lib/data";
import ExperienceCard from "./ExperienceCard";

export default function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineScaleY = useTransform(scrollYProgress, [0.1, 0.8], [0, 1]);
  const lineOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative min-h-screen py-24 md:py-32 px-6 bg-background overflow-hidden"
    >
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20 text-center"
        >
          <motion.h2
            initial={{ clipPath: "inset(-4px 100% -4px 0)" }}
            whileInView={{ clipPath: "inset(-4px 0% -4px 0)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display uppercase tracking-[0.12em] text-4xl md:text-5xl font-normal text-text-primary"
          >
            Experience
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-3 h-1 w-24 mx-auto origin-center rounded-full"
            style={{
              background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            }}
          />
        </motion.div>

        {/* Timeline container */}
        <div className="relative">
          {/* Vertical timeline line (desktop: centre, mobile: left) */}
          <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px">
            {/* Background track */}
            <div className="absolute inset-0 bg-white/[0.06]" />

            {/* Animated fill */}
            <motion.div
              className="absolute top-0 left-0 right-0 origin-top"
              style={{
                scaleY: lineScaleY,
                opacity: lineOpacity,
                background:
                  "linear-gradient(to bottom, #f59e0b, #ef4444, #fbbf24)",
                boxShadow: "0 0 8px rgba(245, 158, 11, 0.4), 0 0 20px rgba(245, 158, 11, 0.15)",
                height: "100%",
              }}
            />
          </div>

          {/* Timeline entries */}
          <div className="relative space-y-16 md:space-y-24">
            {workExperience.map((exp, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={exp.id}
                  className="relative flex items-start"
                >
                  {/* Timeline node */}
                  <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: index * 0.15,
                      }}
                      className="relative"
                    >
                      {/* Pulse ring */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 2.5, opacity: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{
                          duration: 1.5,
                          delay: index * 0.15 + 0.3,
                          ease: "easeOut",
                        }}
                        className="absolute inset-0 rounded-full bg-accent-amber/30"
                      />
                      {/* Dot */}
                      <div
                        className="w-3 h-3 rounded-full bg-accent-amber"
                        style={{
                          boxShadow:
                            "0 0 8px rgba(245, 158, 11, 0.6), 0 0 20px rgba(245, 158, 11, 0.3)",
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Card positioning */}
                  <div
                    className={`
                      w-full pl-12
                      md:pl-0 md:w-[calc(50%-2rem)]
                      ${isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}
                    `}
                  >
                    <ExperienceCard
                      experience={exp}
                      index={index}
                      side={isLeft ? "left" : "right"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
