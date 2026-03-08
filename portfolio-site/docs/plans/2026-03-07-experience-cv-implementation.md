# Work Experience & CV Download Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Add a magnetic glow CV download button to the hero and an interactive 3D timeline work experience section between About and Skills.

**Architecture:** New `DownloadCVButton` component in the Hero, new `Experience/` component directory with `ExperienceTimeline` (section wrapper with scroll-linked timeline) and `ExperienceCard` (3D tilt cards). Data added to `lib/data.ts`. Nav updated with Experience link.

**Tech Stack:** Next.js 15, Motion (framer-motion), Tailwind CSS, Lucide icons, Iconify

---

### Task 1: Copy resume PDF to public directory

**Files:**
- Copy: `Adam_Jarick_2026_Resume.pdf` -> `portfolio-site/public/Adam_Jarick_2026_Resume.pdf`

**Step 1: Copy the file**

```bash
cp "C:/Users/Adam/Desktop/Portfolio/Adam_Jarick_2026_Resume.pdf" "C:/Users/Adam/Desktop/Portfolio/portfolio-site/public/Adam_Jarick_2026_Resume.pdf"
```

**Step 2: Verify the file exists**

```bash
ls -la "C:/Users/Adam/Desktop/Portfolio/portfolio-site/public/Adam_Jarick_2026_Resume.pdf"
```

Expected: File listed with size > 0

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/public/Adam_Jarick_2026_Resume.pdf
git commit -m "add resume PDF to public assets"
```

---

### Task 2: Add work experience data to lib/data.ts

**Files:**
- Modify: `portfolio-site/lib/data.ts`

**Step 1: Add WorkExperience interface and data**

Add after the existing `SocialLink` interface (after line 29) and add the `workExperience` export after `socialLinks` (after line 186):

```typescript
// Add after SocialLink interface (line 29):
export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  type: "full-time" | "internship";
  description: string[];
  techStack: string[];
  companyIcon: string;
}

// Add after socialLinks array (after line 186):
export const workExperience: WorkExperience[] = [
  {
    id: "apate",
    company: "Apate.AI",
    role: "Software Engineer",
    location: "Town Hall, NSW",
    period: "Oct 2024 — Present",
    type: "full-time",
    description: [
      "Architected and deployed an enterprise-grade anti-scam WhatsApp bot, Telegram Bot and Email bot using TypeScript, WebSocket manipulation, and OpenAI GPT, processing 1,000+ messages daily across multiple client deployments.",
      "Developed comprehensive REST API backend with Hono framework and Prisma ORM, featuring multiple endpoints for chat management, bot configuration, and real-time state monitoring with PostgreSQL database integration.",
      "Implemented sophisticated AI-powered content analysis system detecting financial scams, cryptocurrency fraud, and sensitive data exposure using multi-modal OpenAI vision and text analysis.",
      "Worked on client-facing portal delivering real-time scam analytics using React, TypeScript, Redis, ClickHouse, Airbyte, Superset and PostgreSQL. Handled 500+ users and their authentication using JWT tokens through Keycloak.",
      "Containerised application with Docker and deployed to Azure, GCloud and AWS Kubernetes clusters, establishing CI/CD pipelines, Kubernetes services, Helm charts, ConfigMaps and monitoring infrastructure serving multiple enterprise clients.",
    ],
    techStack: [
      "TypeScript",
      "React",
      "Node.js",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "PostgreSQL",
      "Prisma",
      "Redis",
    ],
    companyIcon: "mdi:shield-lock",
  },
  {
    id: "webschool",
    company: "Webschool.au",
    role: "AI Engineer Intern",
    location: "Macquarie, NSW",
    period: "June 2025 — Nov 2025",
    type: "internship",
    description: [
      "Architected and built a Voice Authentication Neural Network for a platform with the purpose of two-factor authentication, breaking down business objectives into actionable tasks using Agile methodologies.",
      "Utilised the PyTorch library to create a Siamese Neural Network which compared two sets of voices to authenticate if they were the same voice for login purposes, using the VoxCeleb database for training with an input of 13 Mel-frequency cepstral coefficients per audio frame and cosine similarity.",
      "Deployed on the company's portal, interweaving its functionality with existing infrastructure.",
    ],
    techStack: ["Python", "PyTorch", "Azure", "Docker"],
    companyIcon: "mdi:school",
  },
];
```

**Step 2: Verify no TypeScript errors**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npx tsc --noEmit --pretty 2>&1 | head -20
```

Expected: No errors related to data.ts

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/lib/data.ts
git commit -m "add work experience data"
```

---

### Task 3: Create DownloadCVButton component

**Files:**
- Create: `portfolio-site/components/Hero/DownloadCVButton.tsx`

**Step 1: Create the component**

```typescript
"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Download } from "lucide-react";

export default function DownloadCVButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Magnetic pull values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < 120) {
        const pull = (1 - distance / 120) * 8;
        mouseX.set((distX / distance) * pull);
        mouseY.set((distY / distance) * pull);
      } else {
        mouseX.set(0);
        mouseY.set(0);
      }
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.8, duration: 0.6, ease: "easeOut" }}
      className="mt-8 pointer-events-auto"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        ref={buttonRef}
        style={{ x: springX, y: springY }}
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Outer gradient border wrapper */}
        <div className="relative group rounded-full p-[1px]">
          {/* Rotating conic gradient border */}
          <div
            className="absolute inset-0 rounded-full nav-gradient-border transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.5 }}
          />

          {/* Ambient glow */}
          <div
            className="absolute inset-0 rounded-full nav-gradient-border blur-md transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.4 : 0.15,
              animation: "glow-pulse 2s ease-in-out infinite, nav-border-rotate 6s linear infinite",
            }}
          />

          {/* Button */}
          <motion.a
            href="/Adam_Jarick_2026_Resume.pdf"
            download
            whileTap={{ scale: 0.95 }}
            className="relative z-10 flex items-center gap-2.5 rounded-full px-6 py-3 font-body text-sm font-medium uppercase tracking-[0.12em] text-text-primary transition-colors duration-200"
            style={{
              background: isHovered
                ? "rgba(245, 158, 11, 0.1)"
                : "rgba(10, 10, 10, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <motion.span
              animate={isHovered ? { y: [0, 3, 0] } : { y: 0 }}
              transition={{
                duration: 0.6,
                repeat: isHovered ? Infinity : 0,
                repeatType: "loop",
              }}
              className="flex items-center"
            >
              <Download size={16} strokeWidth={2} />
            </motion.span>
            Download CV
          </motion.a>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/components/Hero/DownloadCVButton.tsx
git commit -m "add magnetic glow CV download button"
```

---

### Task 4: Integrate DownloadCVButton into HeroText

**Files:**
- Modify: `portfolio-site/components/Hero/HeroText.tsx`

**Step 1: Add import and render the button**

Add import at the top (after line 3):
```typescript
import DownloadCVButton from "./DownloadCVButton";
```

Add the button after the subtitle div's closing `</motion.div>` (after line 71), before the glow div:
```tsx
      <DownloadCVButton />
```

**Step 2: Verify it renders**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npm run build 2>&1 | tail -20
```

Expected: Build succeeds

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/components/Hero/HeroText.tsx
git commit -m "integrate CV download button into hero"
```

---

### Task 5: Create ExperienceCard component

**Files:**
- Create: `portfolio-site/components/Experience/ExperienceCard.tsx`

**Step 1: Create the component**

```typescript
"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Icon } from "@iconify/react";
import type { WorkExperience } from "@/lib/data";

interface ExperienceCardProps {
  experience: WorkExperience;
  index: number;
  side: "left" | "right";
}

export default function ExperienceCard({
  experience,
  index,
  side,
}: ExperienceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      const spot = spotlightRef.current;
      if (!card || !spot) return;

      const rect = card.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const rotateY = ((mouseX - centerX) / centerX) * 5;
      const rotateX = -((mouseY - centerY) / centerY) * 5;

      const spotlightX = (mouseX / rect.width) * 100;
      const spotlightY = (mouseY / rect.height) * 100;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      spot.style.background = `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(245,158,11,0.08) 0%, transparent 60%)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg)";
    }
  }, []);

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: side === "left" ? -80 : 80,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 20,
        delay: index * 0.2,
      }}
    >
      <div
        style={{ perspective: "1000px" }}
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-2 rounded-2xl blur-xl transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle, rgba(245, 158, 11, 0.4), transparent 70%)",
            opacity: isHovered ? 0.15 : 0,
          }}
        />

        {/* Gradient border */}
        <div
          className="absolute -inset-px rounded-2xl transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(135deg, #f59e0b, #ef4444, #fbbf24)",
            backgroundSize: "200% 200%",
            animation: "gradient-shift 8s ease infinite",
            opacity: isHovered ? 1 : 0.3,
          }}
        />

        {/* Card body */}
        <div
          ref={cardRef}
          className="relative rounded-2xl p-6 md:p-8 overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            transition: isHovered
              ? "transform 0.1s ease-out"
              : "transform 0.5s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Spotlight overlay */}
          <div
            ref={spotlightRef}
            className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-accent-amber/10 border border-accent-amber/20">
                <Icon
                  icon={experience.companyIcon}
                  width={24}
                  height={24}
                  className="text-accent-amber"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl md:text-2xl font-normal text-text-primary">
                  {experience.company}
                </h3>
                <p className="font-body text-accent-amber text-sm font-medium mt-0.5">
                  {experience.role}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="font-mono text-xs text-text-secondary">
                    {experience.period}
                  </span>
                  <span className="text-text-secondary/30 hidden sm:inline">|</span>
                  <span className="font-mono text-xs text-text-secondary hidden sm:inline">
                    {experience.location}
                  </span>
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-full border"
                    style={{
                      borderColor:
                        experience.type === "full-time"
                          ? "rgba(245, 158, 11, 0.3)"
                          : "rgba(251, 191, 36, 0.3)",
                      color:
                        experience.type === "full-time"
                          ? "#f59e0b"
                          : "#fbbf24",
                      background:
                        experience.type === "full-time"
                          ? "rgba(245, 158, 11, 0.08)"
                          : "rgba(251, 191, 36, 0.08)",
                    }}
                  >
                    {experience.type === "full-time" ? "Full-time" : "Internship"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description bullets */}
            <div className="space-y-3 mb-6">
              {experience.description.map((bullet, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{
                    duration: 0.4,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut",
                  }}
                  className="flex gap-3"
                >
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-amber/60 flex-shrink-0" />
                  <p className="font-body text-sm leading-relaxed text-text-secondary">
                    {bullet}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-2">
              {experience.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 text-xs font-mono rounded-full bg-background border border-white/5 text-text-secondary transition-all duration-200 hover:border-accent-amber/30 hover:text-accent-amber hover:shadow-[0_0_12px_rgba(245,158,11,0.1)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/components/Experience/ExperienceCard.tsx
git commit -m "add experience card with 3D tilt and spotlight"
```

---

### Task 6: Create ExperienceTimeline component

**Files:**
- Create: `portfolio-site/components/Experience/ExperienceTimeline.tsx`

**Step 1: Create the component**

```typescript
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { workExperience } from "@/lib/data";
import ExperienceCard from "./ExperienceCard";

export default function ExperienceTimeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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
        <div ref={timelineRef} className="relative">
          {/* ── Vertical timeline line (desktop: centre, mobile: left) ── */}
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
                  {/* ── Timeline node ── */}
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

                  {/* ── Card positioning ── */}
                  {/* Mobile: always right of line. Desktop: alternating. */}
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
```

**Step 2: Verify no TypeScript errors**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/components/Experience/ExperienceTimeline.tsx
git commit -m "add experience timeline with scroll-linked animations"
```

---

### Task 7: Update Nav with Experience link

**Files:**
- Modify: `portfolio-site/components/Nav.tsx:8-13`

**Step 1: Add Experience to navLinks**

Change the `navLinks` array (lines 8-13) to:

```typescript
const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
] as const;
```

**Step 2: Verify no TypeScript errors**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/components/Nav.tsx
git commit -m "add experience link to navigation"
```

---

### Task 8: Integrate Experience section into page.tsx

**Files:**
- Modify: `portfolio-site/app/page.tsx`

**Step 1: Add import**

Add after the About import (line 10):
```typescript
import ExperienceTimeline from "@/components/Experience/ExperienceTimeline";
```

**Step 2: Add Experience section between About and the first SectionDivider**

After `<About />` (line 127) and before `<SectionDivider />` (line 129), add:

```tsx
        <SectionDivider />

        {/* Experience */}
        <ExperienceTimeline />
```

So the section flow becomes:
```tsx
        {/* About */}
        <About />

        <SectionDivider />

        {/* Experience */}
        <ExperienceTimeline />

        <SectionDivider />

        {/* Skills */}
```

**Step 3: Build and verify**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors

**Step 4: Commit**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add portfolio-site/app/page.tsx
git commit -m "integrate experience section into homepage"
```

---

### Task 9: Visual testing and polish

**Step 1: Run dev server and visually verify**

```bash
cd C:/Users/Adam/Desktop/Portfolio/portfolio-site && npm run dev
```

**Step 2: Check each feature visually**

Verify in browser at http://localhost:3000:
- [ ] CV download button appears in hero after typewriter animation
- [ ] Button has magnetic pull effect on cursor proximity
- [ ] Button has rotating gradient border and glow
- [ ] Download icon bounces on hover
- [ ] Clicking downloads the PDF
- [ ] Experience section appears between About and Skills
- [ ] Nav includes "Experience" link and scroll spy works
- [ ] Timeline line draws on scroll
- [ ] Timeline nodes pulse in with ring animation
- [ ] Cards slide in from alternating sides on desktop
- [ ] Cards have 3D tilt and spotlight on hover
- [ ] Bullets stagger-reveal on scroll
- [ ] Tech pills have hover glow effect
- [ ] Mobile layout shows single-column with left timeline
- [ ] All animations respect prefers-reduced-motion

**Step 3: Fix any issues found during visual testing**

**Step 4: Final commit if any polish changes were made**

```bash
cd C:/Users/Adam/Desktop/Portfolio
git add -A
git commit -m "polish experience section and CV button"
```
