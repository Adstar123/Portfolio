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
  fold: "#6e6b62",
  check: "#b8b4a8",
  call: "#ff8551",
  raise: "#ff5b1f",
  allIn: "#d24513",
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
          className="relative z-10 w-full max-w-md p-6"
          style={{
            background: "rgba(12, 14, 18, 0.96)",
            border: "1px solid rgba(242, 239, 232, 0.14)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Result header */}
          <div className="flex flex-col items-center gap-2 mb-5">
            <motion.div
              className="flex items-center justify-center w-12 h-12"
              style={{
                background: isCorrect
                  ? "rgba(255, 91, 31, 0.15)"
                  : "rgba(224, 102, 79, 0.15)",
                border: isCorrect
                  ? "1px solid rgba(255, 91, 31, 0.5)"
                  : "1px solid rgba(224, 102, 79, 0.5)",
              }}
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
                <Check size={22} style={{ color: "#ff5b1f" }} />
              ) : (
                <X size={22} style={{ color: "#e0664f" }} />
              )}
            </motion.div>

            <h2
              className="font-mono text-[12px] tracking-[0.22em] uppercase"
              style={{ color: isCorrect ? "#ff5b1f" : "#e0664f" }}
            >
              {isCorrect ? "Correct" : "Off-strategy"}
            </h2>

            <p
              className="text-center leading-relaxed"
              style={{ fontSize: 13, color: "#b8b4a8" }}
            >
              {feedback}
            </p>
          </div>

          {/* Your Action vs GTO Recommends */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className="flex flex-col items-center gap-1 px-3 py-2.5"
              style={{
                background: "rgba(7, 8, 10, 0.7)",
                border: "1px solid rgba(242, 239, 232, 0.06)",
              }}
            >
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{ color: "#6e6b62" }}
              >
                Your Action
              </span>
              <span
                className="font-mono text-[12px] tracking-[0.16em] uppercase"
                style={{ color: STRATEGY_COLOURS[userStrategyKey] }}
              >
                {STRATEGY_LABELS[userStrategyKey]}
              </span>
            </div>
            <div
              className="flex flex-col items-center gap-1 px-3 py-2.5"
              style={{
                background: "rgba(7, 8, 10, 0.7)",
                border: "1px solid rgba(242, 239, 232, 0.06)",
              }}
            >
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{ color: "#6e6b62" }}
              >
                GTO Recommends
              </span>
              <span
                className="font-mono text-[12px] tracking-[0.16em] uppercase"
                style={{ color: STRATEGY_COLOURS[gtoRecommendation] }}
              >
                {STRATEGY_LABELS[gtoRecommendation]}
              </span>
            </div>
          </div>

          {/* GTO Strategy breakdown bars */}
          <div className="mb-5">
            <h4
              className="font-mono text-[10px] tracking-[0.22em] uppercase mb-3"
              style={{ color: "#ff5b1f" }}
            >
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
                    <span
                      className="font-mono text-[11px] tracking-[0.1em] w-12 text-right"
                      style={{ color: "#b8b4a8" }}
                    >
                      {STRATEGY_LABELS[key]}
                    </span>
                    <div
                      className="flex-1 h-2"
                      style={{ background: "rgba(242, 239, 232, 0.06)" }}
                    >
                      <motion.div
                        className="h-full"
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
                    <span
                      className="font-mono text-[11px] w-10 text-right tabular-nums"
                      style={{ color: colour }}
                    >
                      {percentage}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.button
            type="button"
            onClick={onNext}
            data-cursor-hover
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 font-mono text-[11px] tracking-[0.22em] uppercase cursor-pointer"
            style={{
              background: "#ff5b1f",
              color: "#07080a",
              border: "1px solid #ff5b1f",
            }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            Next Hand
            <ArrowRight size={14} />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResultModal;
