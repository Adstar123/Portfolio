import type { Metadata } from "next";
import {
  Space_Grotesk,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adam Jarick · Software Engineer",
  description:
    "Adam Jarick. Software Engineer in Sydney. Currently building software for the Building Commission at the NSW Department of Customer Service.",
  keywords: [
    "Software Engineer",
    "AI Engineer",
    "Full Stack Developer",
    "Sydney",
    "NSW Department of Customer Service",
    "Building Commission",
    "React",
    "TypeScript",
    "Python",
    "PyTorch",
  ],
  authors: [{ name: "Adam Jarick" }],
  creator: "Adam Jarick",
  openGraph: {
    title: "Adam Jarick · Software Engineer",
    description:
      "Software Engineer in Sydney, currently building for the Building Commission at the NSW Department of Customer Service.",
    type: "website",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adam Jarick · Software Engineer",
    description: "Software Engineer building for the Building Commission at NSW DCS.",
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
      className={`${spaceGrotesk.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-display antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
