"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Github, Brain } from "lucide-react";

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

// ─── Tech badges ─────────────────────────────────────────────────────────────

const TECH_STACK = [
  { label: "Python", colour: "#3776ab" },
  { label: "PyTorch", colour: "#ee4c2c" },
  { label: "Flask", colour: "#ffffff" },
  { label: "React", colour: "#61dafb" },
  { label: "TypeScript", colour: "#3178c6" },
  { label: "ONNX", colour: "#005CED" },
  { label: "Tailwind CSS", colour: "#38bdf8" },
];

// ─── Tab types ───────────────────────────────────────────────────────────────

type Tab = "trainer" | "range";

const TABS: { key: Tab; label: string }[] = [
  { key: "trainer", label: "Trainer" },
  { key: "range", label: "Range Viewer" },
];

// ─── Page component ──────────────────────────────────────────────────────────

export default function OpenGTOPage() {
  // Model loading state
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Trainer state
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<TrainerResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("trainer");

  // Stats
  const [stats, setStats] = useState<UserStats>({
    totalHands: 0,
    correctDecisions: 0,
    accuracy: 0,
    sessionStart: new Date().toISOString(),
  });

  // Refs
  const hasStartedRef = useRef(false);

  // ── Model preloading ────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Simulate progress ticks while the model downloads
      const interval = setInterval(() => {
        if (!cancelled) {
          setLoadingProgress((prev) => {
            // Approach 90% asymptotically while loading
            if (prev >= 90) return prev;
            return prev + (90 - prev) * 0.08;
          });
        }
      }, 100);

      try {
        await preloadModel();
        if (!cancelled) {
          clearInterval(interval);
          setLoadingProgress(100);
          // Brief delay for the progress bar to reach 100%
          setTimeout(() => {
            if (!cancelled) setModelLoaded(true);
          }, 300);
        }
      } catch (err) {
        console.error("Failed to load ONNX model:", err);
        clearInterval(interval);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Start new hand ──────────────────────────────────────────────────────

  const startNewHand = useCallback(() => {
    setIsAnimating(true);
    setResult(null);
    setShowResult(false);

    const newScenario = generateRandomScenario();
    setScenario(newScenario);

    // Allow animation time for cards to deal
    setTimeout(() => setIsAnimating(false), 600);
  }, []);

  // ── Auto-start first hand when model loads ──────────────────────────────

  useEffect(() => {
    if (modelLoaded && !hasStartedRef.current) {
      hasStartedRef.current = true;
      startNewHand();
    }
  }, [modelLoaded, startNewHand]);

  // ── Handle user action ──────────────────────────────────────────────────

  const handleAction = useCallback(
    async (action: UIActionType) => {
      if (!scenario || isAnimating || showResult) return;

      setIsAnimating(true);

      try {
        const trainerResult = await evaluateAction(scenario, action);
        setResult(trainerResult);

        // Update stats
        setStats((prev) => {
          const total = prev.totalHands + 1;
          const correct =
            prev.correctDecisions + (trainerResult.isCorrect ? 1 : 0);
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

  // ── Handle next hand ────────────────────────────────────────────────────

  const handleNextHand = useCallback(() => {
    setShowResult(false);
    setResult(null);
    startNewHand();
  }, [startNewHand]);

  // ── Handle result close ─────────────────────────────────────────────────

  const handleResultClose = useCallback(() => {
    setShowResult(false);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative px-6 pt-12 pb-10">
        {/* Background gradient effects — fades out smoothly via mask */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            maskImage:
              "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 40%, transparent 100%)",
          }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.04) 40%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Title */}
          <motion.h1
            className="font-display uppercase tracking-[0.12em] text-5xl sm:text-6xl md:text-7xl font-normal mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ea580c 100%)",
              }}
            >
              OpenGTO
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p
            className="text-lg sm:text-xl text-zinc-400 font-medium mb-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 25 }}
          >
            Game Theory Optimal Poker Trainer
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto mb-6 leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 25 }}
          >
            A neural network trained on millions of poker hands to approximate game
            theory optimal play. The model runs entirely in your browser via ONNX
            Runtime, providing instant GTO strategy analysis for any preflop
            situation in 6-max No Limit Hold&apos;em.
          </motion.p>
          <motion.p
            className="text-xs text-zinc-600 max-w-2xl mx-auto mb-6 italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            This is a simplified web rebuild and may not accurately reflect the
            full desktop experience. For the complete version, download OpenGTO
            from GitHub.
          </motion.p>

          {/* Tech badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 25 }}
          >
            {TECH_STACK.map((tech) => (
              <span
                key={tech.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  color: tech.colour,
                  borderColor: `${tech.colour}33`,
                  backgroundColor: `${tech.colour}0d`,
                }}
              >
                {tech.label}
              </span>
            ))}
          </motion.div>

          {/* GitHub link */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: "spring", stiffness: 200, damping: 25 }}
          >
            <a
              href="https://github.com/Adstar123/OpenGTO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 bg-zinc-800/80 border border-white/10 hover:border-white/20 hover:text-white transition-colors"
            >
              <Github size={16} />
              View on GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Model Loading State ───────────────────────────────────────── */}
      <AnimatePresence>
        {!modelLoaded && (
          <motion.section
            className="px-6 pb-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm">
                {/* Animated brain icon */}
                <motion.div
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10"
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(245,158,11,0.2)",
                      "0 0 0 12px rgba(245,158,11,0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Brain size={24} className="text-amber-400" />
                </motion.div>

                <div className="text-center">
                  <p className="text-sm font-semibold text-zinc-200 mb-1">
                    Loading neural network...
                  </p>
                  <p className="text-xs text-zinc-500">
                    Downloading ONNX model (~2.3 MB)
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #f59e0b, #f97316)",
                    }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>

                <p className="text-xs font-mono text-zinc-500 tabular-nums">
                  {Math.round(loadingProgress)}%
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Main Content (visible after model loads) ──────────────────── */}
      <AnimatePresence>
        {modelLoaded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
          >
            {/* ── Tab Bar ──────────────────────────────────────────────── */}
            <div className="px-6 mb-8">
              <div className="max-w-6xl mx-auto">
                <div className="inline-flex bg-zinc-900/80 rounded-lg p-1 border border-zinc-700/60 gap-1">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-6 py-2 text-sm font-semibold rounded-md transition-colors ${
                        activeTab === tab.key
                          ? "text-amber-400 bg-amber-500/15 border border-amber-500/30"
                          : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tab Content ──────────────────────────────────────────── */}
            <div className="px-6 pb-16">
              <AnimatePresence mode="wait">
                {activeTab === "trainer" ? (
                  <motion.div
                    key="trainer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
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
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="max-w-6xl mx-auto">
                      <RangeViewer />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result Modal ──────────────────────────────────────────────── */}
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

// ─── Trainer View (sub-component) ────────────────────────────────────────────

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
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Table + Actions */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Poker Table */}
          <div className="flex justify-center">
            <PokerTable scenario={scenario} isAnimating={isAnimating} />
          </div>

          {/* Action Panel */}
          <ActionPanel
            scenario={scenario}
            onAction={onAction}
            disabled={isAnimating || showResult}
          />
        </div>

        {/* Right: Stats Panel */}
        <div className="w-full lg:w-auto shrink-0">
          <StatsPanel stats={stats} />
        </div>
      </div>
    </div>
  );
}

