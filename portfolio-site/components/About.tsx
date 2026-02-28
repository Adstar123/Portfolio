"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { bio } from "@/lib/data";

const paragraphs = [
  `${bio.greeting}, ${bio.intro}`,
  bio.current,
  bio.hobby,
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-screen bg-background py-24 px-6 md:px-12 lg:px-24 flex items-center"
    >
      <div className="mx-auto max-w-6xl w-full grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-center">
        {/* ─── Photo (appears first on mobile, second on desktop) ─── */}
        <div className="order-1 md:order-2 md:col-span-2 flex justify-center">
          <motion.div
            style={{ y: photoY }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="relative"
          >
            {/* Gradient glow behind */}
            <div className="absolute inset-0 rounded-full bg-accent-amber opacity-20 blur-2xl scale-110" />

            {/* Animated gradient border */}
            <div
              className="relative rounded-full p-1"
              style={{
                background:
                  "linear-gradient(135deg, #f59e0b, #ef4444, #fbbf24)",
                backgroundSize: "200% 200%",
                animation: "gradient-shift 8s ease infinite",
              }}
            >
              <div className="rounded-full overflow-hidden bg-background">
                <Image
                  src="/headshot.jpg"
                  alt="Adam Jarick"
                  width={320}
                  height={320}
                  className="rounded-full object-cover w-64 h-64 md:w-80 md:h-80"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Text ─── */}
        <div className="order-2 md:order-1 md:col-span-3">
          {/* Section heading */}
          <div className="mb-8">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-text-primary">
              About Me
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="mt-3 h-1 w-24 origin-left rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, #f59e0b, #ef4444)",
              }}
            />
          </div>

          {/* Bio paragraphs */}
          {paragraphs.map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.15,
                ease: "easeOut",
              }}
              className="font-body text-lg leading-relaxed text-text-secondary mb-5 last:mb-0"
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
