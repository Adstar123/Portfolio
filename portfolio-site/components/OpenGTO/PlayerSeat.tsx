"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircleUser } from "lucide-react";
import type { Position, PlayerAction, UIActionType } from "@/lib/opengto/types";

interface PlayerSeatProps {
  position: Position;
  action?: PlayerAction;
  isRevealed: boolean;
  isHero: boolean;
  offsetX: number; // percentage offset from centre
  offsetY: number; // percentage offset from centre
  delay: number;
}

const ACTION_STYLES: Record<
  UIActionType,
  { bg: string; border?: string; text: string; label: string }
> = {
  fold: {
    bg: "bg-red-600",
    text: "text-white",
    label: "FOLD",
  },
  check: {
    bg: "bg-emerald-600",
    text: "text-white",
    label: "CHECK",
  },
  call: {
    bg: "bg-blue-600",
    text: "text-white",
    label: "CALL",
  },
  raise: {
    bg: "bg-transparent",
    border: "border border-amber-500/70",
    text: "text-amber-400",
    label: "RAISE",
  },
  "all-in": {
    bg: "bg-rose-600",
    text: "text-white",
    label: "ALL-IN",
  },
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
  const isFolded = action?.action === "fold";
  const style = action ? ACTION_STYLES[action.action] : undefined;

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${isHero ? "z-40" : "z-30"}`}
      style={{
        left: `calc(50% + ${offsetX}%)`,
        top: `calc(50% + ${offsetY}%)`,
      }}
    >
      <motion.div
        className="flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isFolded && isRevealed ? 0.4 : 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: delay,
        }}
      >
        {/* Position badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${
            isHero
              ? "bg-zinc-800/90 ring-1 ring-amber-500/40"
              : "bg-zinc-800/90 ring-1 ring-white/[0.06]"
          }`}
        >
          <CircleUser
            size={13}
            strokeWidth={1.8}
            className={isHero ? "text-amber-500/80" : "text-zinc-500"}
          />
          <span
            className={`text-[11px] font-semibold tracking-wide ${
              isHero ? "text-amber-300" : "text-zinc-300"
            }`}
          >
            {position}
          </span>
        </div>

        {/* Action badge */}
        <AnimatePresence mode="wait">
          {isRevealed && action && style && (
            <motion.div
              className={`flex flex-col items-center px-3 py-1 rounded-full min-w-[52px] ${style.bg} ${style.border ?? ""}`}
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
              }}
            >
              <span
                className={`text-[10px] font-bold tracking-wider uppercase leading-tight ${style.text}`}
              >
                {style.label}
              </span>
              {action.amount != null && action.action !== "fold" && (
                <span
                  className={`text-[10px] font-semibold font-mono tabular-nums leading-tight ${
                    action.action === "raise"
                      ? "text-amber-300/90"
                      : "text-white/90"
                  }`}
                >
                  {action.amount.toFixed(1)}bb
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero "YOU" badge */}
        {isHero && (
          <motion.div
            className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[9px] font-bold text-zinc-900 tracking-widest uppercase"
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
      </motion.div>
    </div>
  );
};

export default PlayerSeat;
