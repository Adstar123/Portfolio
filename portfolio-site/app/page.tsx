"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import Nav from "@/components/Nav";
import HeroText from "@/components/Hero/HeroText";
import ScrollIndicator from "@/components/Hero/ScrollIndicator";
import About from "@/components/About";
import SkillCardGalaxy from "@/components/Skills/SkillCardGalaxy";
import SkillsGrid from "@/components/Skills/SkillsGrid";
import ProjectCard from "@/components/Projects/ProjectCard";
import ProjectModal from "@/components/Projects/ProjectModal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { projects, type Project } from "@/lib/data";

const ParticleField = dynamic(
  () => import("@/components/Hero/ParticleField"),
  { ssr: false }
);

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
          <ParticleField />
          <HeroText />
          <ScrollIndicator />
        </section>

        {/* About */}
        <About />

        {/* Skills */}
        <section
          id="skills"
          className="relative min-h-screen py-24 md:py-32 px-6 bg-background overflow-hidden"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-16 text-center"
            >
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-text-primary">
                Skills
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-3 h-1 w-24 mx-auto origin-center rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                }}
              />
            </motion.div>
            <div className="hidden md:block">
              <SkillCardGalaxy />
            </div>
            <div className="md:hidden">
              <SkillsGrid />
            </div>
          </div>
        </section>

        {/* Projects */}
        <section
          id="projects"
          className="relative min-h-screen py-24 md:py-32 px-6 bg-background"
        >
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-16 text-center"
            >
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-text-primary">
                Projects
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-3 h-1 w-24 mx-auto origin-center rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)",
                }}
              />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  onSelect={setSelectedProject}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <Contact />
      </main>

      <Footer />

      {/* Project Modal Overlay */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
