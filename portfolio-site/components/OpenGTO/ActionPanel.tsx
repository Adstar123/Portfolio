"use client";

import React, { useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { X, Check, Coins, TrendingUp, Zap } from "lucide-react";
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
}

const ACTION_BUTTONS: ActionButton[] = [
  {
    action: "fold",
    label: "Fold",
    icon: <X size={20} />,
    colour: "#ff453a",
    shortcut: "F",
  },
  {
    action: "check",
    label: "Check",
    icon: <Check size={20} />,
    colour: "#32d74b",
    shortcut: "X",
  },
  {
    action: "call",
    label: "Call",
    icon: <Coins size={20} />,
    colour: "#0a84ff",
    shortcut: "C",
  },
  {
    action: "raise",
    label: "Raise",
    icon: <TrendingUp size={20} />,
    colour: "#ff9f0a",
    shortcut: "R",
  },
  {
    action: "all-in",
    label: "All-In",
    icon: <Zap size={20} />,
    colour: "#ff375f",
    shortcut: "A",
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
    <div className="w-full rounded-2xl bg-zinc-900/80 border border-white/[0.06] p-4 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200 tracking-wide">
          Your Action
        </h3>
        {callAmount > 0 && (
          <span className="text-xs font-mono text-zinc-400">
            To Call:{" "}
            <span className="text-amber-400 font-semibold">
              {callAmount.toFixed(1)} BB
            </span>
          </span>
        )}
      </div>

      {/* Action buttons grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
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
              className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-colors ${
                isDisabled
                  ? "opacity-25 cursor-not-allowed border-white/5 bg-zinc-800/50"
                  : "cursor-pointer border-white/10 bg-zinc-800/80 hover:border-white/20"
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isDisabled ? 0.25 : 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.05,
              }}
              whileHover={!isDisabled ? { y: -3 } : undefined}
              whileTap={!isDisabled ? { scale: 0.93 } : undefined}
            >
              {/* Icon */}
              <span style={{ color: isDisabled ? undefined : btn.colour }}>
                {btn.icon}
              </span>

              {/* Label */}
              <span
                className="text-xs font-semibold tracking-wide"
                style={{ color: isDisabled ? undefined : btn.colour }}
              >
                {btn.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Keyboard shortcut hints */}
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        {ACTION_BUTTONS.map((btn) => (
          <div key={btn.action} className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center w-5 h-5 rounded bg-zinc-700/60 border border-white/10 text-[10px] font-mono text-zinc-400">
              {btn.shortcut}
            </kbd>
            <span className="text-[10px] text-zinc-500">{btn.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionPanel;
