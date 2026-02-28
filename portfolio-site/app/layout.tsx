import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Adam Jarick | Software Engineer",
  description:
    "Software Engineer specialising in AI, full-stack development, and cloud infrastructure. Based in Sydney, Australia.",
  keywords: [
    "Software Engineer",
    "Full Stack Developer",
    "AI Engineer",
    "Sydney",
    "React",
    "TypeScript",
    "Python",
    "Portfolio",
  ],
  authors: [{ name: "Adam Jarick" }],
  creator: "Adam Jarick",
  openGraph: {
    title: "Adam Jarick | Software Engineer",
    description:
      "Software Engineer specialising in AI, full-stack development, and cloud infrastructure.",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Jarick | Software Engineer",
    description:
      "Software Engineer specialising in AI, full-stack development, and cloud infrastructure.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-AU"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
