"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, ArrowUpRight } from "lucide-react";

import PokerTable from "@/components/OpenGTO/PokerTable";
import ActionPanel from "@/components/OpenGTO/ActionPanel";
import ResultModal from "@/components/OpenGTO/ResultModal";
import StatsPanel from "@/components/OpenGTO/StatsPanel";
import RangeViewer from "@/components/OpenGTO/RangeViewer";

import { generateRandomScenario } from "@/lib/opengto/scenarioGenerator";
import { evaluateAction, preloadModel } from "@/lib/opengto/useGtoTrainer";
import type {
  Scenario,
  TrainerResult,
  UserStats,
  UIActionType,
} from "@/lib/opengto/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const TECH_STACK = [
  "Python",
  "PyTorch",
  "Flask",
  "React",
  "TypeScript",
  "ONNX",
  "Tailwind",
];

type Tab = "trainer" | "range";

const TABS: { key: Tab; label: string }[] = [
  { key: "trainer", label: "Trainer" },
  { key: "range", label: "Range Viewer" },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function OpenGTOPage() {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadStep, setLoadStep] = useState<string>("starting");

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<TrainerResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("trainer");

  const [stats, setStats] = useState<UserStats>({
    totalHands: 0,
    correctDecisions: 0,
    accuracy: 0,
    sessionStart: new Date().toISOString(),
  });

  const hasStartedRef = useRef(false);

  // Model preloading
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const interval = setInterval(() => {
        if (!cancelled) {
          setLoadingProgress((prev) => {
            if (prev >= 90) return prev;
            return prev + (90 - prev) * 0.08;
          });
        }
      }, 100);

      let watchdogStep = "starting";
      const watchdog = setTimeout(() => {
        if (!cancelled) {
          setLoadError(`Timed out during step: "${watchdogStep}"`);
        }
      }, 20_000);

      try {
        await preloadModel((step) => {
          watchdogStep = step;
          if (!cancelled) setLoadStep(step);
        });
        if (!cancelled) {
          clearInterval(interval);
          clearTimeout(watchdog);
          setLoadingProgress(100);
          setTimeout(() => {
            if (!cancelled) setModelLoaded(true);
          }, 300);
        }
      } catch (err) {
        clearInterval(interval);
        clearTimeout(watchdog);
        if (!cancelled) {
          const e = err as Error;
          setLoadError(e?.message || String(err));
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const startNewHand = useCallback(() => {
    setIsAnimating(true);
    setResult(null);
    setShowResult(false);
    const newScenario = generateRandomScenario();
    setScenario(newScenario);
    setTimeout(() => setIsAnimating(false), 600);
  }, []);

  useEffect(() => {
    if (modelLoaded && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startNewHand();
    }
  }, [modelLoaded, startNewHand]);

  const handleAction = useCallback(
    async (action: UIActionType) => {
      if (!scenario || isAnimating || showResult) return;
      setIsAnimating(true);
      try {
        const trainerResult = await evaluateAction(scenario, action);
        setResult(trainerResult);
        setStats((prev) => {
          const total = prev.totalHands + 1;
          const correct = prev.correctDecisions + (trainerResult.isCorrect ? 1 : 0);
          return {
            ...prev,
            totalHands: total,
            correctDecisions: correct,
            accuracy: total > 0 ? (correct / total) * 100 : 0,
          };
        });
        setShowResult(true);
      } catch (err) {
        console.error("Failed to evaluate action:", err);
      } finally {
        setIsAnimating(false);
      }
    },
    [scenario, isAnimating, showResult]
  );

  const handleNextHand = useCallback(() => {
    setShowResult(false);
    setResult(null);
    startNewHand();
  }, [startNewHand]);

  const handleResultClose = useCallback(() => {
    setShowResult(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-[var(--pad,32px)] pt-12 pb-12">
        <div className="max-w-[1280px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-12 gap-x-8 mb-10 pb-8 border-b"
            style={{ borderColor: "rgba(242, 239, 232, 0.14)" }}
          >
            <div className="col-span-12 md:col-span-2 mb-4 md:mb-0">
              <span
                className="font-mono text-[11px] tracking-[0.22em] uppercase"
                style={{ color: "#ff5b1f" }}
              >
                PRJ / 01
              </span>
            </div>
            <div className="col-span-12 md:col-span-7">
              <h1
                className="font-display"
                style={{
                  fontSize: "clamp(48px, 7vw, 100px)",
                  fontWeight: 500,
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  color: "#f2efe8",
                }}
              >
                Open
                <span
                  className="font-serif italic"
                  style={{ color: "#ff5b1f", fontWeight: 400 }}
                >
                  GTO
                </span>
                .
              </h1>
              <p
                className="font-serif italic mt-3"
                style={{
                  fontSize: "clamp(18px, 1.6vw, 22px)",
                  color: "#b8b4a8",
                  maxWidth: "32ch",
                }}
              >
                Game Theory Optimal poker preflop trainer. Neural network
                converging toward Nash equilibrium across 169 starting hands.
              </p>
              <p
                className="mt-4 max-w-[60ch]"
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#b8b4a8",
                }}
              >
                A Deep CFR neural network trained on millions of self-played
                preflop spots, served via ONNX Runtime so inference happens in
                the browser. Note: this web rebuild is a simplified version.
                For the full experience, grab the desktop build from GitHub.
              </p>
            </div>
            <div className="col-span-12 md:col-span-3 flex flex-col gap-4 md:items-end">
              <a
                href="https://github.com/Adstar123/OpenGTO"
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                className="inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] tracking-[0.16em] uppercase transition-all"
                style={{
                  border: "1px solid rgba(242, 239, 232, 0.3)",
                  color: "#f2efe8",
                }}
              >
                <Github size={14} />
                GitHub
                <ArrowUpRight size={12} />
              </a>
              <div className="flex flex-wrap gap-1.5 md:justify-end">
                {TECH_STACK.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] tracking-[0.06em] uppercase px-2 py-[3px] border"
                    style={{
                      borderColor: "rgba(242, 239, 232, 0.14)",
                      color: "#b8b4a8",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Loading */}
      <AnimatePresence>
        {!modelLoaded && (
          <motion.section
            className="px-[var(--pad,32px)] pb-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-md mx-auto">
              <div
                className="flex flex-col items-center gap-4 p-6"
                style={{
                  background: "rgba(12, 14, 18, 0.7)",
                  border: "1px solid rgba(242, 239, 232, 0.14)",
                }}
              >
                <div
                  className="font-mono text-[11px] tracking-[0.22em] uppercase"
                  style={{ color: "#ff5b1f" }}
                >
                  Booting neural network
                </div>
                <div
                  className="w-full h-[2px] overflow-hidden"
                  style={{ background: "rgba(242, 239, 232, 0.06)" }}
                >
                  <motion.div
                    className="h-full"
                    style={{ background: "#ff5b1f" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <div
                  className="font-mono text-[10px] tracking-[0.18em] uppercase"
                  style={{ color: "#6e6b62" }}
                >
                  {Math.round(loadingProgress)}% · {loadStep}
                </div>
                {loadError && (
                  <pre
                    className="text-[10px] font-mono whitespace-pre-wrap break-all leading-relaxed mt-2"
                    style={{ color: "#e0664f" }}
                  >
                    {loadError}
                  </pre>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main */}
      <AnimatePresence>
        {modelLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Tabs */}
            <div className="px-[var(--pad,32px)] mb-8">
              <div className="max-w-[1280px] mx-auto">
                <div
                  className="inline-flex"
                  style={{
                    border: "1px solid rgba(242, 239, 232, 0.14)",
                  }}
                >
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      data-cursor-hover
                      className="px-6 py-3 font-mono text-[11px] tracking-[0.18em] uppercase transition-colors"
                      style={{
                        background:
                          activeTab === tab.key ? "#ff5b1f" : "transparent",
                        color: activeTab === tab.key ? "#07080a" : "#b8b4a8",
                        borderRight:
                          tab.key === "trainer"
                            ? "1px solid rgba(242, 239, 232, 0.14)"
                            : "0",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="px-[var(--pad,32px)] pb-16">
              <AnimatePresence mode="wait">
                {activeTab === "trainer" ? (
                  <motion.div
                    key="trainer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TrainerView
                      scenario={scenario}
                      result={result}
                      showResult={showResult}
                      isAnimating={isAnimating}
                      stats={stats}
                      onAction={handleAction}
                      onNextHand={handleNextHand}
                      onResultClose={handleResultClose}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="range"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="max-w-[1280px] mx-auto">
                      <RangeViewer />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResult && result && (
          <ResultModal
            result={result}
            onNext={handleNextHand}
            onClose={handleResultClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Trainer View ────────────────────────────────────────────────────────────

interface TrainerViewProps {
  scenario: Scenario | null;
  result: TrainerResult | null;
  showResult: boolean;
  isAnimating: boolean;
  stats: UserStats;
  onAction: (action: UIActionType) => void;
  onNextHand: () => void;
  onResultClose: () => void;
}

function TrainerView({
  scenario,
  isAnimating,
  showResult,
  stats,
  onAction,
}: TrainerViewProps) {
  return (
    <div className="max-w-[1280px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="flex justify-center">
            <PokerTable scenario={scenario} isAnimating={isAnimating} />
          </div>
          <ActionPanel
            scenario={scenario}
            onAction={onAction}
            disabled={isAnimating || showResult}
          />
        </div>
        <div className="w-full lg:w-auto shrink-0">
          <StatsPanel stats={stats} />
        </div>
      </div>
    </div>
  );
}
