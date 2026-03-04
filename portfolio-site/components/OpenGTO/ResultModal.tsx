"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, ArrowRight } from "lucide-react";
import type { TrainerResult, GTOStrategy } from "@/lib/opengto/types";

interface ResultModalProps {
  result: TrainerResult;
  onNext: () => void;
  onClose: () => void;
}

type StrategyKey = keyof GTOStrategy;

const STRATEGY_LABELS: Record<StrategyKey, string> = {
  fold: "Fold",
  check: "Check",
  call: "Call",
  raise: "Raise",
  allIn: "All-In",
};

const STRATEGY_COLOURS: Record<StrategyKey, string> = {
  fold: "#ff453a",
  check: "#32d74b",
  call: "#0a84ff",
  raise: "#ff9f0a",
  allIn: "#ff375f",
};

/** Map UIActionType to the matching GTOStrategy key for display comparison. */
function uiActionToStrategyKey(action: string): StrategyKey {
  if (action === "all-in") return "allIn";
  return action as StrategyKey;
}

/** Get the GTO-recommended action (highest probability). */
function getGTORecommendation(strategy: GTOStrategy): StrategyKey {
  let best: StrategyKey = "fold";
  let bestProb = -1;
  for (const key of Object.keys(strategy) as StrategyKey[]) {
    if (strategy[key] > bestProb) {
      bestProb = strategy[key];
      best = key;
    }
  }
  return best;
}

const ResultModal: React.FC<ResultModalProps> = ({
  result,
  onNext,
  onClose,
}) => {
  const { isCorrect, feedback, gtoStrategy, userAction } = result;

  // Filter strategy entries > 1% and sort descending
  const strategyEntries = (Object.keys(gtoStrategy) as StrategyKey[])
    .filter((key) => gtoStrategy[key] > 0.01)
    .sort((a, b) => gtoStrategy[b] - gtoStrategy[a]);

  const userStrategyKey = uiActionToStrategyKey(userAction);
  const gtoRecommendation = getGTORecommendation(gtoStrategy);

  return (
    <AnimatePresence>
      {/* Backdrop overlay */}
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <div className="absolute inset-0 backdrop-blur-lg" />

        {/* Modal content */}
        <motion.div
          className="relative z-10 w-full max-w-md rounded-2xl bg-zinc-900/95 border border-white/[0.08] p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Result header */}
          <div className="flex flex-col items-center gap-2 mb-5">
            <motion.div
              className={`flex items-center justify-center w-14 h-14 rounded-full ${
                isCorrect ? "bg-green-500/15" : "bg-red-500/15"
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
            >
              {isCorrect ? (
                <Check size={28} className="text-green-400" />
              ) : (
                <X size={28} className="text-red-400" />
              )}
            </motion.div>

            <h2
              className={`text-xl font-bold ${
                isCorrect ? "text-green-400" : "text-red-400"
              }`}
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </h2>

            <p className="text-sm text-zinc-400 text-center leading-relaxed">
              {feedback}
            </p>
          </div>

          {/* Your Action vs GTO Recommends */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-white/5">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                Your Action
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: STRATEGY_COLOURS[userStrategyKey] }}
              >
                {STRATEGY_LABELS[userStrategyKey]}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl bg-zinc-800/60 border border-white/5">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                GTO Recommends
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: STRATEGY_COLOURS[gtoRecommendation] }}
              >
                {STRATEGY_LABELS[gtoRecommendation]}
              </span>
            </div>
          </div>

          {/* GTO Strategy breakdown bars */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              GTO Strategy
            </h4>
            <div className="flex flex-col gap-2">
              {strategyEntries.map((key, index) => {
                const probability = gtoStrategy[key];
                const percentage = Math.round(probability * 100);
                const colour = STRATEGY_COLOURS[key];

                return (
                  <motion.div
                    key={key}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                      delay: 0.15 + index * 0.06,
                    }}
                  >
                    {/* Label */}
                    <span className="text-xs font-medium text-zinc-300 w-12 text-right">
                      {STRATEGY_LABELS[key]}
                    </span>

                    {/* Bar container */}
                    <div className="flex-1 h-5 rounded-full bg-zinc-800/80 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: colour }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                          delay: 0.25 + index * 0.06,
                        }}
                      />
                    </div>

                    {/* Percentage */}
                    <span
                      className="text-xs font-bold font-mono w-10 text-right tabular-nums"
                      style={{ color: colour }}
                    >
                      {percentage}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Next Hand button */}
          <motion.button
            type="button"
            onClick={onNext}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-zinc-900 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #f97316)",
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Next Hand
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultModal;
