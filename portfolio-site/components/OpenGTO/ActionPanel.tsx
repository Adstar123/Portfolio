"use client";

import React, { useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { DoorOpen, Check, Coins, TrendingUp, Zap } from "lucide-react";
import type { Scenario, UIActionType } from "@/lib/opengto/types";

interface ActionPanelProps {
  scenario: Scenario | null;
  onAction: (action: UIActionType) => void;
  disabled: boolean;
}

interface ActionButton {
  action: UIActionType;
  label: string;
  icon: React.ReactNode;
  colour: string;
  shortcut: string;
  shortcutLabel: string;
}

const ACTION_BUTTONS: ActionButton[] = [
  {
    action: "fold",
    label: "Fold",
    icon: <DoorOpen size={24} strokeWidth={1.8} />,
    colour: "#ff453a",
    shortcut: "F",
    shortcutLabel: "Fold",
  },
  {
    action: "check",
    label: "Check",
    icon: <Check size={24} strokeWidth={2.2} />,
    colour: "#32d74b",
    shortcut: "X",
    shortcutLabel: "Check",
  },
  {
    action: "call",
    label: "Call",
    icon: <Coins size={24} strokeWidth={1.8} />,
    colour: "#0a84ff",
    shortcut: "C",
    shortcutLabel: "Call",
  },
  {
    action: "raise",
    label: "Raise",
    icon: <TrendingUp size={24} strokeWidth={2} />,
    colour: "#ff9f0a",
    shortcut: "R",
    shortcutLabel: "Raise",
  },
  {
    action: "all-in",
    label: "All-In",
    icon: <Zap size={24} strokeWidth={2} />,
    colour: "#ff375f",
    shortcut: "A",
    shortcutLabel: "All-In",
  },
];

const SHORTCUT_MAP: Record<string, UIActionType> = {
  f: "fold",
  x: "check",
  c: "call",
  r: "raise",
  a: "all-in",
};

const ActionPanel: React.FC<ActionPanelProps> = ({
  scenario,
  onAction,
  disabled,
}) => {
  const legalActions = scenario?.legalActions ?? [];

  const isLegal = useCallback(
    (action: UIActionType): boolean => legalActions.includes(action),
    [legalActions]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled || !scenario) return;

      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      const action = SHORTCUT_MAP[e.key.toLowerCase()];
      if (action && isLegal(action)) {
        e.preventDefault();
        onAction(action);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, scenario, isLegal, onAction]);

  const callAmount = scenario ? scenario.currentBet : 0;

  return (
    <motion.div
      className="w-full rounded-2xl bg-zinc-900/80 border border-white/[0.06] p-4 backdrop-blur-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-zinc-100 tracking-wide">
          Your Action
        </h3>
        {callAmount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-white/[0.06] px-2.5 py-1 text-xs font-mono text-zinc-400">
            To Call:
            <span className="text-amber-400 font-bold">
              {callAmount.toFixed(1)} BB
            </span>
          </span>
        )}
      </div>

      {/* Action buttons — single row, 5 equal-width cards */}
      <div className="grid grid-cols-5 gap-2">
        {ACTION_BUTTONS.map((btn, index) => {
          const legal = isLegal(btn.action);
          const isDisabled = disabled || !scenario || !legal;

          return (
            <motion.button
              key={btn.action}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) onAction(btn.action);
              }}
              className={`
                relative flex flex-col items-center justify-center gap-2
                h-20 rounded-xl border transition-colors
                ${
                  isDisabled
                    ? "opacity-[0.2] cursor-not-allowed border-white/[0.04] bg-zinc-800/40"
                    : "cursor-pointer border-white/[0.08] bg-zinc-800/70 hover:bg-zinc-800 hover:border-white/[0.14]"
                }
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isDisabled ? 0.2 : 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.04,
              }}
              whileHover={!isDisabled ? { y: -2, scale: 1.03 } : undefined}
              whileTap={!isDisabled ? { scale: 0.95 } : undefined}
            >
              {/* Icon */}
              <span
                className="transition-colors"
                style={{ color: isDisabled ? "rgb(113 113 122)" : btn.colour }}
              >
                {btn.icon}
              </span>

              {/* Label */}
              <span
                className="text-xs font-semibold tracking-wide transition-colors"
                style={{ color: isDisabled ? "rgb(113 113 122)" : btn.colour }}
              >
                {btn.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Keyboard shortcut hints */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {ACTION_BUTTONS.map((btn) => (
          <div key={btn.action} className="flex items-center gap-1.5">
            <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 rounded bg-zinc-700/50 border border-white/[0.08] px-1 text-[10px] font-mono font-medium text-zinc-400 leading-none">
              {btn.shortcut}
            </kbd>
            <span className="text-[10px] text-zinc-500 font-medium">
              {btn.shortcutLabel}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActionPanel;
