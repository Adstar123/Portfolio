"use client";

import React from "react";
import { motion } from "motion/react";
import { BarChart3, Check, Layers, X } from "lucide-react";
import type { UserStats } from "@/lib/opengto/types";

interface StatsPanelProps {
  stats: UserStats;
}

const RING_RADIUS = 50;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getAccuracyColour(accuracy: number): string {
  if (accuracy >= 70) return "#32d74b"; // green
  if (accuracy >= 50) return "#ff9f0a"; // orange
  return "#ff453a"; // red
}

function getProgressMessage(accuracy: number, total: number): string {
  if (total === 0) return "Play a hand to begin";
  if (accuracy >= 80) return "Excellent GTO play!";
  if (accuracy >= 70) return "Solid understanding";
  if (accuracy >= 50) return "Room for improvement";
  return "Keep practising";
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const { totalHands, correctDecisions, accuracy } = stats;
  const mistakes = totalHands - correctDecisions;
  const accuracyColour = getAccuracyColour(accuracy);
  const progressMessage = getProgressMessage(accuracy, totalHands);

  // SVG ring calculation
  const dashOffset =
    totalHands === 0
      ? RING_CIRCUMFERENCE
      : RING_CIRCUMFERENCE - (accuracy / 100) * RING_CIRCUMFERENCE;

  return (
    <div className="w-[260px] rounded-2xl bg-zinc-900/80 border border-white/[0.06] p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-zinc-200 tracking-wide">
          Session Stats
        </h3>
      </div>

      {/* Accuracy ring */}
      <div className="flex justify-center mb-4">
        <div className="relative w-[120px] h-[120px]">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="8"
            />

            {/* Accuracy ring */}
            <motion.circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke={accuracyColour}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{
                type: "spring",
                stiffness: 60,
                damping: 20,
                delay: 0.2,
              }}
            />
          </svg>

          {/* Centre text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-2xl font-bold font-mono tabular-nums"
              style={{ color: accuracyColour }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.3,
              }}
            >
              {Math.round(accuracy)}%
            </motion.span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {/* Correct */}
        <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-zinc-800/60 border border-white/5">
          <Check size={14} className="text-green-400" />
          <span className="text-base font-bold text-white font-mono tabular-nums">
            {correctDecisions}
          </span>
          <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">
            Correct
          </span>
        </div>

        {/* Total */}
        <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-zinc-800/60 border border-white/5">
          <Layers size={14} className="text-amber-400" />
          <span className="text-base font-bold text-white font-mono tabular-nums">
            {totalHands}
          </span>
          <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">
            Total
          </span>
        </div>

        {/* Mistakes */}
        <div className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl bg-zinc-800/60 border border-white/5">
          <X size={14} className="text-red-400" />
          <span className="text-base font-bold text-white font-mono tabular-nums">
            {mistakes}
          </span>
          <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">
            Mistakes
          </span>
        </div>
      </div>

      {/* Progress message */}
      <motion.p
        className="text-xs text-zinc-400 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {progressMessage}
      </motion.p>
    </div>
  );
};

export default StatsPanel;
