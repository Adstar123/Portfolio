export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string[];
  techStack: string[];
  github?: string;
  live?: string;
  route?: string;
  routeLabel?: string;
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
  stats?: ExperienceStat[];
}

export interface ExperienceStat {
  value: string;
  label: string;
  numericEnd: number;
  suffix?: string;
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
    route: "/projects/opengto",
    routeLabel: "Try the Trainer",
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
    github: "https://github.com/mahit-c/Thesis-AI-Copilot",
    route: "/projects/ai-copilot",
    routeLabel: "View Project",
  },
];

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    colour: "#f59e0b",
    skills: [
      { name: "Python", icon: "skill-icons:python-dark", iconType: "iconify" },
      { name: "TypeScript", icon: "skill-icons:typescript", iconType: "iconify" },
      { name: "JavaScript", icon: "skill-icons:javascript", iconType: "iconify" },
      { name: "Go", icon: "skill-icons:golang", iconType: "iconify" },
      { name: "Rust", icon: "skill-icons:rust", iconType: "iconify" },
      { name: "Scala", icon: "skill-icons:scala-dark", iconType: "iconify" },
      { name: "SQL", icon: "skill-icons:mysql-dark", iconType: "iconify" },
      { name: "Dart", icon: "skill-icons:dart-dark", iconType: "iconify" },
      { name: "HTML", icon: "skill-icons:html", iconType: "iconify" },
      { name: "CSS", icon: "skill-icons:css", iconType: "iconify" },
    ],
  },
  {
    name: "Frontend",
    colour: "#fbbf24",
    skills: [
      { name: "React", icon: "skill-icons:react-dark", iconType: "iconify" },
      { name: "Next.js", icon: "skill-icons:nextjs-dark", iconType: "iconify" },
      { name: "Angular", icon: "skill-icons:angular-dark", iconType: "iconify" },
      { name: "Vue.js", icon: "skill-icons:vuejs-dark", iconType: "iconify" },
      { name: "Flutter", icon: "skill-icons:flutter-dark", iconType: "iconify" },
      { name: "Tailwind", icon: "skill-icons:tailwindcss-dark", iconType: "iconify" },
      { name: "MUI", icon: "skill-icons:materialui-dark", iconType: "iconify" },
      { name: "Three.js", icon: "skill-icons:threejs-dark", iconType: "iconify" },
      { name: "Electron", icon: "skill-icons:electron", iconType: "iconify" },
      { name: "Figma", icon: "skill-icons:figma-dark", iconType: "iconify" },
    ],
  },
  {
    name: "Backend",
    colour: "#f97316",
    skills: [
      { name: "Node.js", icon: "skill-icons:nodejs-dark", iconType: "iconify" },
      { name: "Express", icon: "skill-icons:expressjs-dark", iconType: "iconify" },
      { name: "Django", icon: "skill-icons:django", iconType: "iconify" },
      { name: "Flask", icon: "skill-icons:flask-dark", iconType: "iconify" },
      { name: "Hono", icon: "logos:hono", iconType: "iconify" },
      { name: "Bun", icon: "skill-icons:bun-dark", iconType: "iconify" },
      { name: "REST APIs", icon: "globe", iconType: "lucide" },
      { name: "JWT", icon: "key", iconType: "lucide" },
      { name: "WebSockets", icon: "cable", iconType: "lucide" },
      { name: "Resend", icon: "send", iconType: "lucide" },
      { name: "Postal", icon: "mail", iconType: "lucide" },
      { name: "Keycloak", icon: "simple-icons:keycloak", iconType: "iconify" },
    ],
  },
  {
    name: "Data",
    colour: "#ea580c",
    skills: [
      { name: "PostgreSQL", icon: "skill-icons:postgresql-dark", iconType: "iconify" },
      { name: "MS SQL Server", icon: "devicon:microsoftsqlserver", iconType: "iconify" },
      { name: "Elasticsearch", icon: "devicon:elasticsearch", iconType: "iconify" },
      { name: "Splink", icon: "git-merge", iconType: "lucide" },
      { name: "SQLite", icon: "skill-icons:sqlite", iconType: "iconify" },
      { name: "MongoDB", icon: "skill-icons:mongodb", iconType: "iconify" },
      { name: "DynamoDB", icon: "logos:aws-dynamodb", iconType: "iconify" },
      { name: "Databricks", icon: "simple-icons:databricks", iconType: "iconify" },
      { name: "i2 iBase", icon: "mdi:graph-outline", iconType: "iconify" },
      { name: "Prisma", icon: "skill-icons:prisma", iconType: "iconify" },
      { name: "Drizzle", icon: "simple-icons:drizzle", iconType: "iconify" },
      { name: "Redis", icon: "skill-icons:redis-dark", iconType: "iconify" },
      { name: "ClickHouse", icon: "devicon:clickhouse", iconType: "iconify" },
      { name: "Firebase", icon: "devicon:firebase", iconType: "iconify" },
      { name: "PyTorch", icon: "skill-icons:pytorch-dark", iconType: "iconify" },
      { name: "Burn", icon: "flame", iconType: "lucide" },
      { name: "Valkey", icon: "database", iconType: "lucide" },
    ],
  },
  {
    name: "DevOps",
    colour: "#ef4444",
    skills: [
      { name: "Docker", icon: "skill-icons:docker", iconType: "iconify" },
      { name: "Kubernetes", icon: "skill-icons:kubernetes", iconType: "iconify" },
      { name: "AWS", icon: "skill-icons:aws-dark", iconType: "iconify" },
      { name: "Azure", icon: "skill-icons:azure-dark", iconType: "iconify" },
      { name: "GCloud", icon: "skill-icons:gcp-dark", iconType: "iconify" },
      { name: "Terraform", icon: "skill-icons:terraform-dark", iconType: "iconify" },
      { name: "GitHub Actions", icon: "skill-icons:githubactions-dark", iconType: "iconify" },
      { name: "ArgoCD", icon: "devicon:argocd", iconType: "iconify" },
      { name: "Helm", icon: "devicon:helm", iconType: "iconify" },
      { name: "Grafana", icon: "skill-icons:grafana-dark", iconType: "iconify" },
      { name: "Datadog", icon: "devicon:datadog", iconType: "iconify" },
      { name: "Cloudflare", icon: "skill-icons:cloudflare-dark", iconType: "iconify" },
      { name: "Jest", icon: "skill-icons:jest", iconType: "iconify" },
      { name: "Playwright", icon: "devicon:playwright", iconType: "iconify" },
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
    url: "https://linkedin.com/in/adam-jarick",
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

export const workExperience: WorkExperience[] = [
  {
    id: "dcs",
    company: "NSW Department of Customer Service",
    role: "Software Engineer",
    location: "Sydney, NSW",
    period: "Apr 2026 → Now",
    type: "full-time",
    description: [
      "Own the entity resolution platform that consolidates hundreds of millions of names and companies from close to 100 source systems into deduplicated, mutually enriched master tables, built on Splink probabilistic record linkage in Databricks.",
      "Built and own the Elasticsearch layer that gives analysts and building inspectors fuzzy name and company search across those hundreds of millions of rows, plus the risk rating that directs inspectors towards the sites most likely to be non-compliant.",
      "Sole full stack engineer on a team of 15+ otherwise specialised in backend and data engineering, running ETL in Azure Data Factory and Databricks and owning the Postal/SMTP alerting the analytics team and field inspectors rely on.",
    ],
    techStack: [
      "Python",
      "TypeScript",
      "SQL",
      "Azure Databricks",
      "Azure Data Factory",
      "MS SQL Server",
      "Elasticsearch",
      "Splink",
      "i2 iBase",
    ],
    companyIcon: "mdi:office-building-outline",
    stats: [
      { value: "100M+", label: "records linked", numericEnd: 100, suffix: "M+" },
      { value: "~100", label: "source systems", numericEnd: 0 },
      { value: "Splink", label: "entity resolution", numericEnd: 0 },
    ],
  },
  {
    id: "apate",
    company: "Apate.AI",
    role: "Software Engineer",
    location: "Town Hall, NSW",
    period: "Oct 2024 → Apr 2026",
    type: "full-time",
    description: [
      "Joined as one of the first engineers and helped grow the platform from zero to over $1M in annual revenue.",
      "Sole architect and developer of the anti-scam conversational agents for WhatsApp, Telegram and email, built end to end in TypeScript with WebSocket manipulation and OpenAI models to engage scammers. They harvested hundreds of thousands of intelligence artefacts for clients, from bank accounts to crypto wallets.",
      "Cut voice bot response latency from 1.2 seconds to 150 milliseconds by standing up an Australian ElevenLabs endpoint on Cloudflare edge infrastructure.",
      "Architected and built the client insights portal on my own in React and TypeScript over ClickHouse, Redis, Airbyte and Superset, serving hundreds of users authenticated through Keycloak and JWT.",
      "Containerised the platform with Docker and deployed to Kubernetes on Azure, AWS and GCP with Helm charts, GitHub Actions pipelines and monitoring, covered by unit and integration tests.",
    ],
    techStack: [
      "TypeScript",
      "React",
      "Node.js",
      "OpenAI",
      "Docker",
      "Kubernetes",
      "AWS",
      "DynamoDB",
      "Azure",
      "ClickHouse",
      "Redis",
    ],
    companyIcon: "mdi:robot-outline",
    stats: [
      { value: "$1M+", label: "annual revenue", numericEnd: 0 },
      { value: "150ms", label: "voice latency", numericEnd: 150, suffix: "ms" },
      { value: "100K+", label: "intel artefacts", numericEnd: 100, suffix: "K+" },
    ],
  },
  {
    id: "webschool",
    company: "Webschool.au",
    role: "AI Engineer Intern",
    location: "Macquarie, NSW",
    period: "Jun 2025 → Nov 2025",
    type: "internship",
    description: [
      "Architected and built a Voice Authentication Neural Network for a platform with the purpose of two-factor authentication, breaking down business objectives into actionable tasks using Agile methodologies.",
      "Utilised the PyTorch library to create a Siamese Neural Network which compared two sets of voices to authenticate if they were the same voice for login purposes, using the VoxCeleb database for training with an input of 13 Mel-frequency cepstral coefficients per audio frame and cosine similarity.",
      "Deployed on the company's portal, interweaving its functionality with existing infrastructure.",
    ],
    techStack: ["Python", "PyTorch", "Azure", "Docker"],
    companyIcon: "mdi:school",
  },
  {
    id: "macquarie",
    company: "Macquarie University",
    role: "BE (Hons) Software Eng · Cyber Security",
    location: "Sydney",
    period: "2021 → 2025",
    type: "full-time",
    description: [
      "Double degree in Software Engineering (BE Honours) and Cyber Security (Bachelor of Information Technology), graduating with a Distinction average.",
      "Honours thesis: AI Co-Pilot, a Chrome extension delivering personalised learning recommendations from quiz performance and engagement signals.",
      "Built a Deep CFR poker agent on the side that converges toward Nash equilibrium. It became the OpenGTO project.",
    ],
    techStack: [
      "Algorithms",
      "Cryptography",
      "Networks",
      "ML",
      "Distributed Systems",
    ],
    companyIcon: "mdi:school-outline",
  },
];

export const bio = {
  greeting: "Hey",
  intro:
    "I'm Adam, a Software Engineer based in Sydney with a double degree in Software Engineering (Honours) and Cyber Security from Macquarie University. I build things at the intersection of AI, full-stack development, and cloud infrastructure.",
  current:
    "Currently at the NSW Department of Customer Service, I'm building software solutions for the Building Commission. Previously at Apate.AI I architected and deployed anti-scam systems processing thousands of messages daily across WhatsApp, Telegram, and email, and before that I built voice authentication neural networks at Webschool.au.",
  hobby:
    "When I'm not shipping for the Building Commission, I'm training poker AI to play Nash equilibrium strategies or tinkering with whatever catches my interest next.",
};
