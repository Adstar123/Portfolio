"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Icon } from "@iconify/react";

// IntersectionObserver hook — pauses animation only when fully out of view,
// not when the user happens to hover over it.
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

type Phase = "login" | "loading" | "recommendations";

const STUDENT_ID = "45678901";

// ─── Phase durations (ms) ────────────────────────────────────────────────────
const TYPING_PER_CHAR = 80;
const LOGIN_DWELL_AFTER_TYPING = 500;
const POST_LOGIN_BUTTON_PULSE = 320;
const LOADING_DWELL = 2200;
const RECOMMENDATIONS_DWELL = 7500;

// Three different recommendation profiles to cycle through
type RecVariant = "struggling" | "mid" | "strong";

const VARIANTS: RecVariant[] = ["struggling", "mid", "strong"];

interface RecData {
  moduleTitle: string;
  summary: string;
  signals: { label: string; value: string; ok: boolean }[];
  strengths: string[];
  improvements: string[];
}

const REC_DATA: Record<RecVariant, RecData> = {
  struggling: {
    moduleTitle: "Security Incident Response",
    summary:
      "Strong start but quiz scores dipped 22% on §3.2 and you skipped two practical exercises. Time-on-page averaged 18s for linked readings — well under the 90s target. Revisit §3.1 before retrying §3.2 and click through the embedded case studies.",
    signals: [
      { label: "Quiz §3.2 score", value: "58%", ok: false },
      { label: "Engagement time", value: "18s avg", ok: false },
      { label: "Skipped exercises", value: "2 of 5", ok: false },
      { label: "Linked readings opened", value: "0 / 3", ok: false },
      { label: "Quiz retry attempts", value: "3", ok: false },
      { label: "Scroll depth", value: "42%", ok: false },
      { label: "Video pauses", value: "1", ok: false },
      { label: "Bookmarked items", value: "0", ok: false },
    ],
    strengths: ["Completed §3.1 quiz first try", "Watched intro video in full"],
    improvements: [
      "Re-read §3.1 before §3.2 retry",
      "Open the 3 linked NIST case studies",
      "Complete the practical lab exercises",
    ],
  },
  mid: {
    moduleTitle: "Threat Modelling Foundations",
    summary:
      "Solid pace overall. Quiz scores are above the cohort median but you're skipping the linked deep-dive readings and only completing half the practical exercises. Bumping engagement on the optional content will close the gap to the top quartile.",
    signals: [
      { label: "Module quiz avg", value: "78%", ok: true },
      { label: "Engagement time", value: "47s avg", ok: true },
      { label: "Practical exercises", value: "3 of 6", ok: false },
      { label: "Linked readings opened", value: "1 / 4", ok: false },
      { label: "Quiz retry attempts", value: "1", ok: true },
      { label: "Scroll depth", value: "78%", ok: true },
      { label: "Video pauses", value: "5", ok: true },
      { label: "Bookmarked items", value: "2", ok: true },
    ],
    strengths: [
      "Consistent quiz performance",
      "Strong scroll-depth on core readings",
      "Healthy video engagement",
    ],
    improvements: [
      "Try the remaining practical exercises (Lab 4-6)",
      "Open the STRIDE deep-dive reading",
      "Aim for top-quartile by reviewing optional case studies",
    ],
  },
  strong: {
    moduleTitle: "Cryptographic Protocols",
    summary:
      "Top-decile performance across the module. Every signal points to deep engagement — high quiz scores, full reading completion, multiple bookmarks, and video rewinds on key proofs. You're ready for the advanced module.",
    signals: [
      { label: "Module quiz avg", value: "94%", ok: true },
      { label: "Engagement time", value: "112s avg", ok: true },
      { label: "Practical exercises", value: "8 of 8", ok: true },
      { label: "Linked readings opened", value: "5 / 5", ok: true },
      { label: "Quiz retry attempts", value: "0", ok: true },
      { label: "Scroll depth", value: "100%", ok: true },
      { label: "Video pauses", value: "12", ok: true },
      { label: "Bookmarked items", value: "6", ok: true },
    ],
    strengths: [
      "Perfect exercise completion",
      "Deep engagement with proofs (12 video pauses)",
      "All linked readings opened",
      "6 bookmarks suggests revision-ready",
    ],
    improvements: [
      "Move to Advanced Cryptographic Protocols",
      "Consider tutoring peers on RSA proofs",
    ],
  },
};

export default function CopilotMock() {
  const [phase, setPhase] = useState<Phase>("login");
  const [typed, setTyped] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [variantIdx, setVariantIdx] = useState(0);
  const [containerRef, inView] = useInView<HTMLDivElement>(0.15);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Animation runs whenever the section is visible. No hover-pause so a
  // user with their cursor parked over it doesn't stall the loop.
  const paused = !inView;

  const variant: RecVariant = VARIANTS[variantIdx % VARIANTS.length];
  const data = REC_DATA[variant];

  function clearAll() {
    timeouts.current.forEach((t) => clearTimeout(t));
    timeouts.current = [];
  }
  function schedule(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timeouts.current.push(t);
  }

  useEffect(() => {
    clearAll();
    if (paused) return;

    setPhase("login");
    setTyped("");
    setButtonPressed(false);

    let i = 0;
    function typeNext() {
      if (i >= STUDENT_ID.length) {
        schedule(() => {
          setButtonPressed(true);
          schedule(() => {
            setPhase("loading");
            schedule(() => {
              setPhase("recommendations");
              schedule(() => {
                setVariantIdx((v) => (v + 1) % VARIANTS.length);
                setRestartKey((k) => k + 1);
              }, RECOMMENDATIONS_DWELL);
            }, LOADING_DWELL);
          }, POST_LOGIN_BUTTON_PULSE);
        }, LOGIN_DWELL_AFTER_TYPING);
        return;
      }
      setTyped(STUDENT_ID.slice(0, i + 1));
      i += 1;
      schedule(typeNext, TYPING_PER_CHAR);
    }
    schedule(typeNext, 600);

    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey, paused]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center px-4 py-6"
    >
      {/* Faux Chrome window frame */}
      <div className="relative w-full max-w-[440px] mx-auto">
        {/* Browser chrome bar */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-t-[14px]"
          style={{
            background: "#1c1c1c",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <div className="flex-1 mx-2">
            <div className="h-3 rounded-full bg-[#2a2a2a]" />
          </div>
          <div className="relative w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center">
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: "#ff5b1f" }}
            />
            <Icon icon="mdi:puzzle" width={11} height={11} color="#999" />
          </div>
        </div>

        {/* Extension popup */}
        <div
          className="rounded-b-[14px] overflow-hidden"
          style={{
            background: "#f5f5f5",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,91,31,0.15)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#9c1c2e" }}
          >
            <div className="flex items-center gap-2 text-white">
              <Icon icon="mdi:auto-awesome" width={18} height={18} />
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: 0.2,
                }}
              >
                CSA Co-Pilot
              </span>
            </div>
            {phase !== "login" && (
              <Icon
                icon="mdi:cog"
                width={16}
                height={16}
                color="rgba(255,255,255,0.85)"
              />
            )}
          </div>

          {/* Body */}
          <div
            className="px-5 py-6 relative overflow-hidden"
            style={{ color: "#1f1f1f", minHeight: 460 }}
          >
            <AnimatePresence mode="wait">
              {phase === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center gap-3 py-6"
                >
                  <p
                    style={{
                      color: "#9c1c2e",
                      fontWeight: 700,
                      fontFamily: "Georgia, serif",
                      fontSize: 16,
                      lineHeight: 1.3,
                    }}
                  >
                    Hello!
                    <br />
                    Welcome to the CSA Co-pilot.
                  </p>
                  <p
                    style={{
                      color: "#444",
                      fontStyle: "italic",
                      fontSize: 12,
                      lineHeight: 1.4,
                      maxWidth: "30ch",
                    }}
                  >
                    Please login using your student ID to get started.
                  </p>
                  <div
                    className="w-full mt-3 px-3 py-2.5 rounded-md text-[13px]"
                    style={{
                      background: "#fff",
                      border: "1px solid #ddd",
                      color: "#333",
                      fontFamily: "system-ui, sans-serif",
                      minHeight: 40,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {typed.length === 0 ? (
                      <span style={{ color: "#bbb" }}>Enter your Student ID</span>
                    ) : (
                      <span>
                        {typed}
                        <span
                          className="inline-block w-[1px] h-[14px] ml-[1px] align-middle"
                          style={{
                            background: "#9c1c2e",
                            animation: "signal-flicker 1s infinite",
                          }}
                        />
                      </span>
                    )}
                  </div>
                  <motion.button
                    type="button"
                    className="mt-2 px-7 py-2 rounded-md text-white font-semibold text-[12px]"
                    style={{ background: "#9c1c2e", letterSpacing: 0.5 }}
                    animate={
                      buttonPressed
                        ? { scale: [1, 0.92, 1], transition: { duration: 0.3 } }
                        : { scale: 1 }
                    }
                  >
                    Login
                  </motion.button>
                </motion.div>
              )}

              {phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col items-center text-center gap-4 py-10"
                >
                  <p
                    style={{
                      color: "#9c1c2e",
                      fontFamily: "Georgia, serif",
                      fontSize: 13,
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    Your tailored recommendations are loading...
                    <br />
                    Please wait
                  </p>
                  <SmileLoader />
                  <p
                    style={{
                      color: "#777",
                      fontSize: 10,
                      fontStyle: "italic",
                      marginTop: 8,
                    }}
                  >
                    Analysing quiz scores, time-on-page, skipped lessons, link
                    clicks, scroll depth, video pauses, retries and bookmarks…
                  </p>
                </motion.div>
              )}

              {phase === "recommendations" && (
                <motion.div
                  key={`rec-${variant}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col gap-3"
                >
                  <div className="text-center">
                    <h3
                      style={{
                        color: "#9c1c2e",
                        fontFamily: "Georgia, serif",
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {data.moduleTitle}
                    </h3>
                    <p
                      style={{
                        color: "#666",
                        fontSize: 11,
                        marginTop: 2,
                        fontStyle: "italic",
                      }}
                    >
                      Recommendations · End of Module
                    </p>
                    <div
                      className="mx-auto mt-2"
                      style={{
                        width: 180,
                        height: 1,
                        background: "#9c1c2e",
                      }}
                    />
                  </div>

                  {/* Overall summary */}
                  <div
                    className="rounded-md p-3"
                    style={{ background: "#fff", border: "1px solid #ddd" }}
                  >
                    <h4
                      style={{
                        color: "#9c1c2e",
                        fontFamily: "Georgia, serif",
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      Overall Summary
                    </h4>
                    <TypedParagraph text={data.summary} delayStart={120} />
                  </div>

                  {/* Signals grid */}
                  <div
                    className="rounded-md p-3"
                    style={{ background: "#fff", border: "1px solid #ddd" }}
                  >
                    <h4
                      style={{
                        color: "#9c1c2e",
                        fontFamily: "Georgia, serif",
                        fontSize: 12,
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      Engagement Signals
                    </h4>
                    <ul
                      className="grid gap-1"
                      style={{
                        gridTemplateColumns: "1fr 1fr",
                        fontFamily: "system-ui",
                      }}
                    >
                      {data.signals.map((s, i) => (
                        <SignalRow
                          key={s.label}
                          label={s.label}
                          value={s.value}
                          ok={s.ok}
                          delay={i * 0.05}
                        />
                      ))}
                    </ul>
                  </div>

                  {/* Strengths + Improvements columns */}
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className="rounded-md p-3"
                      style={{ background: "#fff", border: "1px solid #ddd" }}
                    >
                      <h4
                        style={{
                          color: "#1a7f37",
                          fontFamily: "Georgia, serif",
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        Strengths
                      </h4>
                      <ul
                        className="text-[10px] space-y-1"
                        style={{ color: "#333", fontFamily: "system-ui" }}
                      >
                        {data.strengths.map((s) => (
                          <li key={s} className="flex items-start gap-1">
                            <span style={{ color: "#1a7f37" }}>+</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className="rounded-md p-3"
                      style={{ background: "#fff", border: "1px solid #ddd" }}
                    >
                      <h4
                        style={{
                          color: "#9c1c2e",
                          fontFamily: "Georgia, serif",
                          fontSize: 11,
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        Next Steps
                      </h4>
                      <ul
                        className="text-[10px] space-y-1"
                        style={{ color: "#333", fontFamily: "system-ui" }}
                      >
                        {data.improvements.map((s) => (
                          <li key={s} className="flex items-start gap-1">
                            <span style={{ color: "#9c1c2e" }}>→</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Smile loader ─────────────────────────────────────────────────────────────

function SmileLoader() {
  const dots = Array.from({ length: 11 });
  return (
    <div className="relative" style={{ width: 96, height: 60 }}>
      {dots.map((_, i) => {
        const t = i / (dots.length - 1);
        const x = t * 90 + 3;
        const y = 30 + Math.sin(t * Math.PI) * 25;
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: x,
              top: y,
              width: 6,
              height: 6,
              background: "#9c1c2e",
              animation: `typing-bounce 1.4s ease-in-out infinite`,
              animationDelay: `${i * 0.08}s`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Typed paragraph ──────────────────────────────────────────────────────────

function TypedParagraph({
  text,
  delayStart,
}: {
  text: string;
  delayStart: number;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    let i = 0;
    let tickHandle: ReturnType<typeof setTimeout> | null = null;
    const start = setTimeout(() => {
      function step() {
        i = Math.min(text.length, i + 2);
        setShown(i);
        if (i < text.length) {
          tickHandle = setTimeout(step, 16);
        }
      }
      step();
    }, delayStart);

    return () => {
      clearTimeout(start);
      if (tickHandle) clearTimeout(tickHandle);
    };
  }, [text, delayStart]);

  return (
    <p
      className="text-[10.5px] leading-[1.55]"
      style={{ color: "#333", fontFamily: "system-ui" }}
    >
      {text.slice(0, shown)}
      {shown < text.length && (
        <span
          className="inline-block w-[1px] h-[10px] align-middle"
          style={{
            background: "#9c1c2e",
            animation: "signal-flicker 1s infinite",
          }}
        />
      )}
    </p>
  );
}

// ─── Signal row ───────────────────────────────────────────────────────────────

function SignalRow({
  label,
  value,
  ok,
  delay,
}: {
  label: string;
  value: string;
  ok: boolean;
  delay: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + delay, duration: 0.3 }}
      className="flex items-center justify-between gap-2 px-1 py-0.5"
      style={{ fontSize: 9.5 }}
    >
      <span style={{ color: "#666" }} className="truncate">
        {label}
      </span>
      <span
        style={{
          color: ok ? "#1a7f37" : "#9c1c2e",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </motion.li>
  );
}
