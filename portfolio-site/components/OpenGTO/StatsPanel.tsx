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
  if (accuracy >= 70) return "#ff5b1f";
  if (accuracy >= 50) return "#ff8551";
  return "#e0664f";
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
      iconColour: "#ff5b1f",
      value: correctDecisions,
      label: "Correct",
    },
    {
      icon: Layers,
      iconColour: "#f2efe8",
      value: totalHands,
      label: "Total",
    },
    {
      icon: X,
      iconColour: "#e0664f",
      value: mistakes,
      label: "Off-strategy",
    },
  ];

  return (
    <div
      className="w-[300px] p-5 backdrop-blur-sm flex flex-col"
      style={{
        background: "rgba(12, 14, 18, 0.7)",
        border: "1px solid rgba(242, 239, 232, 0.14)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={14} style={{ color: "#ff5b1f" }} />
        <h3
          className="font-mono text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "#ff5b1f" }}
        >
          Session Stats
        </h3>
      </div>

      {/* Accuracy ring */}
      <div className="flex justify-center mb-6">
        <div className="relative w-[150px] h-[150px]">
          <svg viewBox="0 0 150 150" className="w-full h-full -rotate-90">
            <circle
              cx="75"
              cy="75"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(242, 239, 232, 0.08)"
              strokeWidth="6"
            />
            <motion.circle
              cx="75"
              cy="75"
              r={RING_RADIUS}
              fill="none"
              stroke={accuracyColour}
              strokeWidth="6"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="font-display tabular-nums"
              style={{
                color: accuracyColour,
                fontSize: 36,
                fontWeight: 500,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
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
            <span
              className="font-mono text-[9px] tracking-[0.22em] uppercase mt-1"
              style={{ color: "#6e6b62" }}
            >
              Accuracy
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="flex flex-col gap-2 mb-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className="flex items-center gap-3 px-3 py-2.5"
              style={{
                background: "rgba(7, 8, 10, 0.6)",
                border: "1px solid rgba(242, 239, 232, 0.06)",
              }}
              variants={statCardVariants}
              initial="hidden"
              animate="visible"
              custom={i}
            >
              <div
                className="flex items-center justify-center w-8 h-8"
                style={{
                  border: "1px solid rgba(242, 239, 232, 0.06)",
                }}
              >
                <Icon size={14} style={{ color: card.iconColour }} />
              </div>
              <div className="flex flex-col">
                <span
                  className="font-display tabular-nums leading-tight"
                  style={{
                    color: "#f2efe8",
                    fontWeight: 500,
                    fontSize: 18,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.value}
                </span>
                <span
                  className="font-mono text-[9px] tracking-[0.18em] uppercase"
                  style={{ color: "#6e6b62" }}
                >
                  {card.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        className="text-center mt-auto pt-2 font-mono text-[10px] tracking-[0.18em] uppercase"
        style={{ color: "#b8b4a8" }}
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
