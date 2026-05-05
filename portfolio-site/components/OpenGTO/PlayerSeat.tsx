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
  { bg: string; border: string; text: string; label: string }
> = {
  fold: {
    bg: "rgba(7, 8, 10, 0.85)",
    border: "1px solid rgba(242, 239, 232, 0.18)",
    text: "#6e6b62",
    label: "FOLD",
  },
  check: {
    bg: "rgba(7, 8, 10, 0.85)",
    border: "1px solid rgba(242, 239, 232, 0.3)",
    text: "#b8b4a8",
    label: "CHECK",
  },
  call: {
    bg: "rgba(7, 8, 10, 0.85)",
    border: "1px solid rgba(255, 133, 81, 0.5)",
    text: "#ff8551",
    label: "CALL",
  },
  raise: {
    bg: "rgba(7, 8, 10, 0.85)",
    border: "1px solid rgba(255, 91, 31, 0.7)",
    text: "#ff5b1f",
    label: "RAISE",
  },
  "all-in": {
    bg: "#ff5b1f",
    border: "1px solid #ff5b1f",
    text: "#07080a",
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
          className="flex items-center gap-1.5 px-3 py-1"
          style={{
            background: "rgba(7, 8, 10, 0.9)",
            border: isHero
              ? "1px solid rgba(255, 91, 31, 0.5)"
              : "1px solid rgba(242, 239, 232, 0.1)",
          }}
        >
          <CircleUser
            size={11}
            strokeWidth={1.6}
            style={{ color: isHero ? "#ff5b1f" : "#6e6b62" }}
          />
          <span
            className="font-mono text-[10px] tracking-[0.18em] uppercase"
            style={{ color: isHero ? "#ff5b1f" : "#b8b4a8" }}
          >
            {position}
          </span>
        </div>

        {/* Action badge */}
        <AnimatePresence mode="wait">
          {isRevealed && action && style && (
            <motion.div
              className="flex flex-col items-center px-3 py-1 min-w-[52px]"
              style={{
                background: style.bg,
                border: style.border,
              }}
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
                className="font-mono text-[10px] tracking-[0.16em] uppercase leading-tight"
                style={{ color: style.text }}
              >
                {style.label}
              </span>
              {action.amount != null && action.action !== "fold" && (
                <span
                  className="font-mono text-[10px] tabular-nums leading-tight"
                  style={{ color: style.text, opacity: 0.85 }}
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
            className="px-2.5 py-0.5 font-mono text-[9px] tracking-[0.22em] uppercase"
            style={{ background: "#ff5b1f", color: "#07080a" }}
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
