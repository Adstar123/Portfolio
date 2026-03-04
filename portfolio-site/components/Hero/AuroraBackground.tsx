"use client";

import { useRef, useState, useEffect } from "react";

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Observe the About section — pause aurora once it's fully out of view
    const aboutSection = document.getElementById("about");
    if (!aboutSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When About is not intersecting and we've scrolled past it, pause
        setPaused(!entry.isIntersecting && window.scrollY > aboutSection.offsetTop);
      },
      { rootMargin: "200px 0px 0px 0px" }
    );

    observer.observe(aboutSection);
    return () => observer.disconnect();
  }, []);

  const animationState = paused ? "paused" : "running";

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Amber blob — top left */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, rgba(245, 158, 11, 0.6), transparent 70%)",
          top: "-10%",
          left: "-5%",
          filter: "blur(80px)",
          animation: "aurora-drift-1 18s ease-in-out infinite",
          animationPlayState: animationState,
        }}
      />
      {/* Warm red blob — centre right */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, rgba(239, 68, 68, 0.5), transparent 70%)",
          top: "20%",
          right: "-10%",
          filter: "blur(100px)",
          animation: "aurora-drift-2 22s ease-in-out infinite",
          animationPlayState: animationState,
        }}
      />
      {/* Gold blob — bottom centre */}
      <div
        className="absolute w-[550px] h-[550px] rounded-full opacity-[0.1]"
        style={{
          background:
            "radial-gradient(circle, rgba(251, 191, 36, 0.5), transparent 70%)",
          bottom: "-15%",
          left: "30%",
          filter: "blur(90px)",
          animation: "aurora-drift-3 15s ease-in-out infinite",
          animationPlayState: animationState,
        }}
      />
    </div>
  );
}
