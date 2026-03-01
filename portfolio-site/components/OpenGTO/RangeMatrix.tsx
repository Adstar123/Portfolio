"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { indexToHandType } from "@/lib/opengto/card";
import type { RangeData, GTOStrategy } from "@/lib/opengto/types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface RangeMatrixProps {
  rangeData: RangeData;
  selectedHand: string | null;
  onHandSelect: (hand: string) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];

const ACTION_COLORS: Record<string, string> = {
  fold: "#3b82f6",
  check: "#22c55e",
  call: "#22c55e",
  raise: "#f97316",
  allIn: "#ef4444",
};

const LEGEND_ITEMS = [
  { label: "Fold", colour: ACTION_COLORS.fold },
  { label: "Check", colour: ACTION_COLORS.check },
  { label: "Call", colour: ACTION_COLORS.call },
  { label: "Raise", colour: ACTION_COLORS.raise },
  { label: "All-In", colour: ACTION_COLORS.allIn },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function getStrategyGradient(strategy: GTOStrategy | undefined): string {
  if (!strategy) return ACTION_COLORS.fold;

  const entries = Object.entries(strategy)
    .filter(([, v]) => v > 0.01)
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) return ACTION_COLORS.fold;
  if (entries.length === 1)
    return ACTION_COLORS[entries[0][0]] || ACTION_COLORS.fold;

  // Multi-colour gradient
  const stops: string[] = [];
  let pos = 0;
  for (const [action, prob] of entries) {
    const color = ACTION_COLORS[action] || ACTION_COLORS.fold;
    stops.push(`${color} ${pos}%`);
    pos += prob * 100;
    stops.push(`${color} ${pos}%`);
  }
  return `linear-gradient(to right, ${stops.join(", ")})`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function RangeMatrix({
  rangeData,
  selectedHand,
  onHandSelect,
}: RangeMatrixProps) {
  // Pre-compute the 13x13 cell data
  const cells = useMemo(() => {
    const result: {
      handType: string;
      row: number;
      col: number;
      isPair: boolean;
      background: string;
    }[] = [];

    for (let row = 0; row < 13; row++) {
      for (let col = 0; col < 13; col++) {
        const handType = indexToHandType(row * 13 + col);
        const strategy = rangeData[handType];
        const isPair = row === col;
        const background = getStrategyGradient(strategy);
        result.push({ handType, row, col, isPair, background });
      }
    }
    return result;
  }, [rangeData]);

  return (
    <div className="flex flex-col gap-3">
      {/* Matrix grid */}
      <div
        className="grid gap-[1px] bg-zinc-800/50 rounded-lg overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(13, 1fr)`,
        }}
      >
        {cells.map(({ handType, isPair, background }) => {
          const isSelected = selectedHand === handType;

          return (
            <motion.button
              key={handType}
              onClick={() => onHandSelect(handType)}
              whileHover={{ scale: 1.12, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative aspect-square flex items-center justify-center cursor-pointer"
              style={{
                background,
                fontSize: "clamp(8px, 1.2vw, 12px)",
                boxShadow: isSelected
                  ? "inset 0 0 0 2px #fbbf24, 0 0 8px rgba(251,191,36,0.5)"
                  : isPair
                    ? "inset 0 0 0 1px rgba(255,255,255,0.15)"
                    : "none",
              }}
            >
              <span
                className="font-semibold leading-none select-none"
                style={{
                  color: "#fff",
                  textShadow: "0 1px 3px rgba(0,0,0,0.7)",
                }}
              >
                {handType}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend bar */}
      <div className="flex items-center justify-center gap-4 text-xs text-zinc-400">
        {LEGEND_ITEMS.map(({ label, colour }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: colour }}
            />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
