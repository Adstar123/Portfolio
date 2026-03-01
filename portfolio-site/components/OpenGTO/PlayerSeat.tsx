"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "lucide-react";
import type { Position, PlayerAction } from "@/lib/opengto/types";

interface PlayerSeatProps {
  position: Position;
  action?: PlayerAction;
  isRevealed: boolean;
  isHero: boolean;
  offsetX: number; // percentage offset from centre
  offsetY: number; // percentage offset from centre
  delay: number;
}

const ACTION_COLORS: Record<string, string> = {
  fold: "#ff453a",
  check: "#32d74b",
  call: "#0a84ff",
  raise: "#ff9f0a",
  "all-in": "#ff375f",
};

const ACTION_LABELS: Record<string, string> = {
  fold: "Fold",
  check: "Check",
  call: "Call",
  raise: "Raise",
  "all-in": "All-In",
};

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  position,
  action,
  isRevealed,
  isHero,
  offsetX,
  offsetY,
  delay,
}) => {
  const actionColor = action ? ACTION_COLORS[action.action] : undefined;
  const isFolded = action?.action === "fold";

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${isHero ? "z-40" : "z-30"}`}
      style={{
        left: `calc(50% + ${offsetX}%)`,
        top: `calc(50% + ${offsetY}%)`,
      }}
    >
      <motion.div
        className={`flex flex-col items-center gap-1 ${isFolded ? "opacity-40" : ""}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isFolded ? 0.4 : 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: delay,
        }}
      >
        <div className="flex flex-col items-center gap-1">
          {/* Position badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              isHero
                ? "bg-[rgba(30,25,20,0.9)] border-amber-700/50"
                : "bg-black/75 border-white/10"
            }`}
          >
            <User
              size={14}
              className={isHero ? "text-amber-500" : "text-zinc-500"}
            />
            <span className="text-xs font-semibold text-white tracking-wide">
              {position}
            </span>
          </div>

          {/* Action display */}
          <AnimatePresence mode="wait">
            {isRevealed && action && (
              <motion.div
                className="flex flex-col items-center px-3 py-1.5 bg-black/85 rounded-lg min-w-[55px]"
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                style={{
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: actionColor,
                }}
              >
                <span
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: actionColor }}
                >
                  {ACTION_LABELS[action.action]}
                </span>
                {action.amount != null && action.action !== "fold" && (
                  <span className="text-[11px] font-bold text-white font-mono">
                    {action.amount.toFixed(1)}bb
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero indicator */}
          {isHero && (
            <motion.div
              className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg text-[9px] font-bold text-zinc-900 tracking-widest"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: delay + 0.15,
              }}
            >
              YOU
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerSeat;
