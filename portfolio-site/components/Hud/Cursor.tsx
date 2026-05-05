"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // Default to true so the divs render on first pass and refs are populated.
  // If the device is touch / coarse pointer, we'll disable in the effect.
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) {
      setSupported(false);
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = -100;
    let my = -100;
    let rx = mx;
    let ry = my;
    let initialised = false;

    function show() {
      if (dot) dot.style.opacity = "1";
      if (ring) ring.style.opacity = "1";
    }

    function hide() {
      if (dot) dot.style.opacity = "0";
      if (ring) ring.style.opacity = "0";
    }

    function onMove(e: PointerEvent) {
      mx = e.clientX;
      my = e.clientY;
      if (!initialised) {
        rx = mx;
        ry = my;
        initialised = true;
      }
      show();
    }

    function onLeave() {
      hide();
    }

    function onOver(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest(
        "a, button, [role='button'], input, textarea, select, [data-cursor-hover]"
      );
      const text = target.closest("input, textarea");
      const state = text ? "text" : interactive ? "hover" : "default";
      if (dot) dot.dataset.state = state;
      if (ring) ring.dataset.state = state;
    }

    let raf = 0;
    function tick() {
      // Ring lags slightly
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      if (dot) dot.style.transform = `translate3d(${mx - 5}px, ${my - 5}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerover", onOver);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
    };
  }, []);

  if (!supported) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9999,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ff5b1f",
          boxShadow: "0 0 14px rgba(255, 91, 31, 0.85)",
          opacity: 0,
          transition:
            "opacity 0.2s, width 0.25s cubic-bezier(.2,.8,.2,1), height 0.25s cubic-bezier(.2,.8,.2,1), background 0.25s",
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        className="cursor-ring"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 9998,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid rgba(242, 239, 232, 0.55)",
          opacity: 0,
          transition:
            "opacity 0.3s, width 0.3s cubic-bezier(.2,.8,.2,1), height 0.3s cubic-bezier(.2,.8,.2,1), border-color 0.3s",
          willChange: "transform",
        }}
      />
      <style jsx global>{`
        .cursor-dot[data-state="hover"] {
          width: 14px !important;
          height: 14px !important;
          background: #ff5b1f !important;
        }
        .cursor-ring[data-state="hover"] {
          width: 64px !important;
          height: 64px !important;
          border-color: #ff5b1f !important;
        }
        .cursor-dot[data-state="text"] {
          width: 3px !important;
          height: 24px !important;
          border-radius: 1px !important;
          background: #ff5b1f !important;
        }
        .cursor-ring[data-state="text"] {
          opacity: 0 !important;
        }
      `}</style>
    </>
  );
}
