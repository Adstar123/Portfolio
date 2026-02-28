"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "About", href: "#about" },
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

    handleScroll(); // check on mount in case page is already scrolled
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

  const scrollTo = useCallback(
    (href: string) => {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      setMobileOpen(false);
    },
    []
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-50 glass"
        >
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            {/* Left — Name */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group font-heading text-xl font-bold text-text-primary transition-colors"
            >
              <span className="group-hover:gradient-text transition-all">
                Adam Jarick
              </span>
            </button>

            {/* Right — Desktop links */}
            <ul className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.slice(1);
                return (
                  <li key={link.href} className="relative">
                    <button
                      onClick={() => scrollTo(link.href)}
                      className={cn(
                        "font-body text-sm tracking-wide transition-colors pb-1",
                        isActive
                          ? "text-text-primary"
                          : "text-text-secondary hover:text-text-primary"
                      )}
                    >
                      {link.label}
                    </button>

                    {isActive && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-cyan"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </nav>

          {/* Mobile drawer */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="md:hidden overflow-hidden border-t border-white/5"
              >
                <ul className="flex flex-col gap-2 px-6 py-4">
                  {navLinks.map((link) => {
                    const isActive = activeSection === link.href.slice(1);
                    return (
                      <li key={link.href}>
                        <button
                          onClick={() => scrollTo(link.href)}
                          className={cn(
                            "w-full text-left font-body text-base py-2 transition-colors",
                            isActive
                              ? "text-text-primary"
                              : "text-text-secondary hover:text-text-primary"
                          )}
                        >
                          {link.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
