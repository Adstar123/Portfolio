"use client";

import React from "react";
import { motion } from "motion/react";
import { BarChart3, Check, Layers, X } from "lucide-react";
import type { UserStats } from "@/lib/opengto/types";

interface StatsPanelProps {
  stats: UserStats;
}

const RING_RADIUS = 62;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getAccuracyColour(accuracy: number): string {
  if (accuracy >= 70) return "#32d74b"; // green
  if (accuracy >= 50) return "#ff9f0a"; // orange
  return "#ff453a"; // red
}

function getProgressMessage(accuracy: number, total: number): string {
  if (total === 0) return "Start playing to track your progress";
  if (accuracy >= 80) return "Excellent GTO play!";
  if (accuracy >= 70) return "Solid understanding";
  if (accuracy >= 50) return "Room for improvement";
  return "Keep practising";
}

const statCardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 18,
      delay: 0.3 + i * 0.1,
    },
  }),
};

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

  const statCards = [
    {
      icon: Check,
      iconColour: "text-green-400",
      bgAccent: "bg-green-500/10",
      borderAccent: "border-green-500/20",
      value: correctDecisions,
      label: "Correct",
    },
    {
      icon: Layers,
      iconColour: "text-amber-400",
      bgAccent: "bg-amber-500/10",
      borderAccent: "border-amber-500/20",
      value: totalHands,
      label: "Total",
    },
    {
      icon: X,
      iconColour: "text-red-400",
      bgAccent: "bg-red-500/10",
      borderAccent: "border-red-500/20",
      value: mistakes,
      label: "Mistakes",
    },
  ];

  return (
    <div className="w-[300px] rounded-2xl bg-zinc-900/80 border border-white/[0.06] p-5 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={16} className="text-amber-500" />
        <h3 className="text-sm font-semibold text-zinc-200 tracking-wide">
          Session Stats
        </h3>
      </div>

      {/* Accuracy ring — larger */}
      <div className="flex justify-center mb-6">
        <div className="relative w-[150px] h-[150px]">
          <svg
            viewBox="0 0 150 150"
            className="w-full h-full -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx="75"
              cy="75"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />

            {/* Accuracy ring */}
            <motion.circle
              cx="75"
              cy="75"
              r={RING_RADIUS}
              fill="none"
              stroke={accuracyColour}
              strokeWidth="10"
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
              className="text-3xl font-bold font-mono tabular-nums"
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
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-0.5">
              Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards — stacked vertically */}
      <div className="flex flex-col gap-2.5 mb-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border ${card.borderAccent} ${card.bgAccent} bg-zinc-800/50`}
              variants={statCardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/80">
                <Icon size={16} className={card.iconColour} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white font-mono tabular-nums leading-tight">
                  {card.value}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                  {card.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Progress message */}
      <motion.p
        className="text-xs text-zinc-400 text-center mt-auto pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {progressMessage}
      </motion.p>
    </div>
  );
};

export default StatsPanel;
