"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import HudChrome from "@/components/Hud/HudChrome";
import Marquee from "@/components/Hud/Marquee";
import HeroIntro from "@/components/Hero/HeroIntro";
import AboutSection from "@/components/Sections/AboutSection";
import ExperienceSection from "@/components/Sections/ExperienceSection";
import SkillsSection from "@/components/Sections/SkillsSection";
import ProjectsSection from "@/components/Sections/ProjectsSection";
import ContactSection from "@/components/Sections/ContactSection";
import Footer from "@/components/Footer";

const ShardScene = dynamic(() => import("@/components/Scene/ShardScene"), {
  ssr: false,
});

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const minDelay = new Promise((r) => setTimeout(r, 350));
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    Promise.all([minDelay, fontsReady]).then(() => {
      requestAnimationFrame(() => setLoaded(true));
    });
  }, []);

  return (
    <>
      {/* Loader */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "#07080a" }}
          >
            <div className="flex flex-col items-center gap-8">
              <div
                className="font-display flex gap-[0.04em]"
                style={{
                  fontSize: "clamp(72px, 12vw, 160px)",
                  fontWeight: 600,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                <span style={{ color: "#f2efe8" }}>A</span>
                <span
                  className="font-serif italic"
                  style={{ color: "#ff5b1f", fontWeight: 400 }}
                >
                  J
                </span>
              </div>
              <div
                style={{
                  width: "min(380px, 60vw)",
                  height: 1,
                  background: "rgba(242, 239, 232, 0.14)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#ff5b1f",
                    transformOrigin: "left",
                  }}
                />
              </div>
              <div
                className="flex items-center gap-6 font-mono text-[11px] tracking-[0.22em] uppercase"
                style={{ color: "#6e6b62" }}
              >
                <span>Boot · 0.0.1</span>
                <span>Sydney</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Three.js scene */}
      {loaded && <ShardScene />}

      {/* HUD chrome — fixed, always-on */}
      <HudChrome />

      {/* Page content */}
      <main className="relative">
        {/* Hero */}
        <section
          id="hero"
          className="relative min-h-screen flex flex-col"
          style={{ paddingBottom: 80 }}
        >
          <HeroIntro />
        </section>

        {/* Marquee bridge */}
        <div className="relative z-[10] w-full">
          <Marquee />
        </div>

        {/* About */}
        <AboutSection />

        {/* Experience */}
        <ExperienceSection />

        {/* Skills */}
        <SkillsSection />

        {/* Projects */}
        <ProjectsSection />

        {/* Contact */}
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
