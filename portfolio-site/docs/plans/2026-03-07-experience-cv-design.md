# Work Experience Section & CV Download Button — Design Doc

**Date:** 2026-03-07
**Status:** Approved

## Overview

Two additions to the portfolio:
1. A magnetic glow CV download button in the hero section
2. An interactive 3D timeline work experience section between About and Skills

## 1. CV Download — Magnetic Glow Hero CTA

### Placement
In the hero section, below the subtitle typewriter text, centred.

### Component
`components/Hero/DownloadCVButton.tsx`

### Visual Behaviour
- **Magnetic pull:** Tracks cursor within ~120px radius, shifts up to 8px toward mouse using spring physics (stiffness: 150, damping: 15)
- **Animated gradient border:** Rotating conic gradient (amber -> red -> gold), matching nav border animation
- **Ambient glow:** Soft amber box-shadow pulsing on 2s cycle (reuses `glow-pulse` animation)
- **Hover state:** Download icon bounces downward, border glow intensifies, background shifts to subtle amber/10
- **Click state:** Brief scale-down (0.95) then release
- **Label:** "Download CV" with Lucide `download` icon
- **Entrance:** Fades in with staggered delay after subtitle typewriter finishes

### File Handling
Copy `Adam_Jarick_2026_Resume.pdf` into `portfolio-site/public/` for static serving.
Link target: `/Adam_Jarick_2026_Resume.pdf`

## 2. Work Experience — Interactive 3D Timeline

### Placement
New section between About and Skills with `id="experience"`. Nav updated to include "Experience" link.

### Page Flow
Hero -> About -> **Experience** -> Skills -> Projects -> Contact -> Footer

### Data Structure

New types in `lib/data.ts`:

```typescript
interface WorkExperience {
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
```

Two entries:
- **Apate.AI** — Software Engineer, Oct 2024-Present, Town Hall NSW
- **Webschool.au** — AI Engineer Internship, June 2025-Nov 2025, Macquarie NSW

### Layout

**Desktop (md+):**
- Vertical timeline with glowing animated line down the centre
- Cards alternate left/right of the timeline
- Pulsing amber nodes with ring animation at each entry
- Glowing particle trail flows down the timeline line on scroll

**Mobile:**
- Single column, timeline line on left edge
- Nodes on left, cards extend right
- Simplified particle effects for performance

### Components

**`components/Experience/ExperienceTimeline.tsx`** — Main section wrapper
- Section header with clipPath reveal animation and gradient underline (matching Skills/Projects)
- Scroll-linked timeline line that draws from top to bottom (`useScroll` + `useTransform` on `scaleY`)
- Contains timeline nodes and cards

**`components/Experience/ExperienceCard.tsx`** — Individual role card
- 3D perspective tilt on hover (rotateX/rotateY from cursor, ~5deg max)
- Spotlight radial gradient following cursor inside card
- Animated rotating conic gradient border (amber -> red -> gold)
- Glassmorphism background (bg-white/[0.03], backdrop-blur-md)
- Content:
  - Company name (Playfair Display) + company icon (Iconify)
  - Role title, period, location (DM Sans)
  - Description bullets with staggered scroll reveal (0.1s delay per bullet)
  - Tech stack pills with hover glow

### Animations

- **Timeline line draw:** scaleY 0->1 driven by scroll progress through section
- **Node pulse:** Dot expands with ring animation when entering viewport
- **Card entrances:** Spring slide-in from respective side (left: -80px, right: +80px), stiffness: 60, damping: 20, staggered delay per card
- **Bullet reveals:** Each bullet slides up with fade, 0.1s stagger
- **Tech pill hover:** Subtle scale-up + glow matching skill card style

### Consistency
- Reuses same animation patterns as ProjectCard (3D tilt, spotlight, gradient border)
- Same section header style as Skills/Projects
- Same colour palette (amber/red/gold)
- Same glassmorphism and typography conventions
