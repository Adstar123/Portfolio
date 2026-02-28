export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string[];
  techStack: string[];
  github?: string;
  live?: string;
}

export interface Skill {
  name: string;
  icon: string;
  iconType: "iconify" | "lucide";
}

export interface SkillCategory {
  name: string;
  colour: string;
  skills: Skill[];
}

export interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

export const projects: Project[] = [
  {
    id: "opengto",
    title: "OpenGTO",
    tagline: "Neural network-powered poker preflop trainer",
    description: [
      "Built a Deep Counterfactual Regret Minimisation (Deep CFR) system with three neural networks that converge towards Nash equilibrium through self-play across 20,000+ training iterations.",
      "Engineered a 317-dimensional feature extraction pipeline and 8-stage curriculum learning system with weighted reservoir sampling managing 5 million+ training samples.",
      "Developed a cross-platform Electron/React/TypeScript desktop application featuring interactive poker table visualisation, real-time GTO feedback, and a Range Viewer for all 169 starting hands.",
    ],
    techStack: [
      "PyTorch",
      "React",
      "TypeScript",
      "Electron",
      "Flask",
      "Python",
      "CI/CD",
    ],
    github: "https://github.com/Adstar123/OpenGTO",
  },
  {
    id: "ai-copilot",
    title: "AI Co-Pilot Chrome Extension",
    tagline: "AI-driven learning analytics Chrome extension",
    description: [
      "Analysed learning analytics from students across multiple learning platforms, providing AI-driven recommendations and feedback through a Google Chrome extension.",
      "Results demonstrated increased student engagement, improved results, and higher motivation to continue learning.",
      "Built using Chrome Extension APIs, injecting JavaScript into IFrame windows to communicate with SCORM and Moodle APIs for data extraction.",
    ],
    techStack: [
      "JavaScript",
      "HTML",
      "CSS",
      "REST APIs",
      "Chrome APIs",
      "LLM Integration",
    ],
  },
];

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    colour: "#3b82f6",
    skills: [
      { name: "Python", icon: "skill-icons:python-dark", iconType: "iconify" },
      { name: "TypeScript", icon: "skill-icons:typescript", iconType: "iconify" },
      { name: "JavaScript", icon: "skill-icons:javascript", iconType: "iconify" },
      { name: "SQL", icon: "skill-icons:mysql-dark", iconType: "iconify" },
      { name: "Dart", icon: "skill-icons:dart-dark", iconType: "iconify" },
      { name: "HTML", icon: "skill-icons:html", iconType: "iconify" },
      { name: "CSS", icon: "skill-icons:css", iconType: "iconify" },
    ],
  },
  {
    name: "Frontend",
    colour: "#8b5cf6",
    skills: [
      { name: "React", icon: "skill-icons:react-dark", iconType: "iconify" },
      { name: "Next.js", icon: "skill-icons:nextjs-dark", iconType: "iconify" },
      { name: "Tailwind", icon: "skill-icons:tailwindcss-dark", iconType: "iconify" },
      { name: "Electron", icon: "skill-icons:electron", iconType: "iconify" },
      { name: "Figma", icon: "skill-icons:figma-dark", iconType: "iconify" },
    ],
  },
  {
    name: "Backend",
    colour: "#06b6d4",
    skills: [
      { name: "Node.js", icon: "skill-icons:nodejs-dark", iconType: "iconify" },
      { name: "Flask", icon: "skill-icons:flask-dark", iconType: "iconify" },
      { name: "PostgreSQL", icon: "skill-icons:postgresql-dark", iconType: "iconify" },
      { name: "Prisma", icon: "skill-icons:prisma", iconType: "iconify" },
      { name: "REST APIs", icon: "globe", iconType: "lucide" },
      { name: "PyTorch", icon: "skill-icons:pytorch-dark", iconType: "iconify" },
    ],
  },
  {
    name: "DevOps",
    colour: "#22d3ee",
    skills: [
      { name: "Docker", icon: "skill-icons:docker", iconType: "iconify" },
      { name: "Kubernetes", icon: "skill-icons:kubernetes", iconType: "iconify" },
      { name: "AWS", icon: "skill-icons:aws-dark", iconType: "iconify" },
      { name: "Azure", icon: "skill-icons:azure-dark", iconType: "iconify" },
      { name: "GCloud", icon: "skill-icons:gcp-dark", iconType: "iconify" },
      { name: "Terraform", icon: "skill-icons:terraform-dark", iconType: "iconify" },
      { name: "CI/CD", icon: "skill-icons:githubactions-dark", iconType: "iconify" },
    ],
  },
];

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/Adstar123",
    icon: "github",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/adam-jarick-1154b7211",
    icon: "linkedin",
  },
  {
    name: "Email",
    url: "mailto:adstar3108@gmail.com",
    icon: "mail",
  },
  {
    name: "Phone",
    url: "tel:0431773937",
    icon: "phone",
  },
];

export const bio = {
  greeting: "Hey",
  intro:
    "I'm Adam, a Software Engineer based in Sydney with a double degree in Software Engineering (Honours) and Cyber Security from Macquarie University. I build things at the intersection of AI, full-stack development, and cloud infrastructure.",
  current:
    "Currently at Apate.AI, I architect anti-scam systems processing thousands of messages daily across WhatsApp, Telegram, and email. Previously, I built voice authentication neural networks at Webschool.au.",
  hobby:
    "When I'm not deploying Kubernetes clusters, I'm training poker AI to play Nash equilibrium strategies or tinkering with whatever catches my interest next.",
};
