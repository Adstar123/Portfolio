"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Nav() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Show nav after scrolling past 50% of viewport height
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.5);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    const sectionIds = navLinks.map((link) => link.href.slice(1));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-40% 0px -55% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Close mobile menu if nav becomes invisible
  useEffect(() => {
    if (!visible) setMobileOpen(false);
  }, [visible]);

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const scrollTo = useCallback((href: string) => {
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  }, []);

  return (
    <>
      {/* ── Floating Pill Nav ──────────────────────────────────────────── */}
      <AnimatePresence>
        {visible && (
          <motion.header
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            {/* Outer gradient border wrapper */}
            <div className="group relative rounded-full p-[1px]">
              {/* Rotating conic gradient border */}
              <div className="absolute inset-0 rounded-full nav-gradient-border opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Ambient glow (blurred copy of gradient) */}
              <div className="absolute inset-0 rounded-full nav-gradient-border opacity-20 group-hover:opacity-40 blur-md transition-opacity duration-300" />

              {/* Glass pill */}
              <nav
                className="relative z-10 rounded-full flex items-center"
                style={{
                  background: "rgba(10, 10, 10, 0.7)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  boxShadow:
                    "0 4px 30px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.04), inset 0 0.5px 0 rgba(255,255,255,0.06)",
                }}
              >
                {/* AJ Monogram */}
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="pl-5 pr-4 py-2.5 font-display text-base font-semibold uppercase tracking-[0.15em] text-white hover:text-amber-400 transition-colors duration-200"
                >
                  AJ
                </button>

                {/* Divider */}
                <div className="h-4 w-px bg-white/10 shrink-0" />

                {/* Desktop links */}
                <ul className="hidden md:flex items-center gap-0.5 px-2 py-1">
                  {navLinks.map((link, index) => {
                    const isActive = activeSection === link.href.slice(1);
                    return (
                      <li key={link.href} className="relative">
                        {/* Sliding active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="nav-pill"
                            className="absolute inset-0 rounded-full"
                            style={{
                              background:
                                "rgba(245, 158, 11, 0.1)",
                              boxShadow:
                                "0 0 12px rgba(245, 158, 11, 0.06)",
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 30,
                            }}
                          />
                        )}

                        <motion.button
                          onClick={() => scrollTo(link.href)}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.15 + index * 0.05,
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                          }}
                          className={cn(
                            "relative z-10 px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.15em] font-medium transition-colors duration-150",
                            isActive
                              ? "text-white"
                              : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                          )}
                        >
                          {link.label}
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="md:hidden px-4 py-2.5 text-zinc-400 hover:text-white transition-colors duration-200"
                  aria-label="Toggle menu"
                >
                  <Menu size={18} strokeWidth={2} />
                </button>
              </nav>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── Mobile Full-Screen Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center"
            style={{
              background: "rgba(5, 5, 5, 0.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{
                delay: 0.2,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X size={28} strokeWidth={1.5} />
            </motion.button>

            {/* AJ Monogram */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 25,
              }}
              className="absolute top-7 left-6"
            >
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileOpen(false);
                }}
                className="font-display text-xl font-semibold uppercase tracking-[0.15em] text-white"
              >
                AJ
              </button>
            </motion.div>

            {/* Centred navigation links */}
            <ul className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{
                      delay: 0.1 + i * 0.08,
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                    }}
                  >
                    <button
                      onClick={() => scrollTo(link.href)}
                      className={cn(
                        "font-display uppercase tracking-[0.2em] text-3xl sm:text-4xl font-normal transition-colors duration-200",
                        isActive
                          ? "text-amber-400"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      {link.label}
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            {/* Decorative gradient accent */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-24 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #f59e0b, transparent)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
