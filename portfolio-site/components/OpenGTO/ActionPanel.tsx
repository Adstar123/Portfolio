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
    icon: <DoorOpen size={22} strokeWidth={1.6} />,
    colour: "#b8b4a8",
    shortcut: "F",
    shortcutLabel: "Fold",
  },
  {
    action: "check",
    label: "Check",
    icon: <Check size={22} strokeWidth={2} />,
    colour: "#b8b4a8",
    shortcut: "X",
    shortcutLabel: "Check",
  },
  {
    action: "call",
    label: "Call",
    icon: <Coins size={22} strokeWidth={1.6} />,
    colour: "#ff8551",
    shortcut: "C",
    shortcutLabel: "Call",
  },
  {
    action: "raise",
    label: "Raise",
    icon: <TrendingUp size={22} strokeWidth={2} />,
    colour: "#ff5b1f",
    shortcut: "R",
    shortcutLabel: "Raise",
  },
  {
    action: "all-in",
    label: "All-In",
    icon: <Zap size={22} strokeWidth={2} />,
    colour: "#ff5b1f",
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
      className="w-full p-4 backdrop-blur-sm"
      style={{
        background: "rgba(12, 14, 18, 0.7)",
        border: "1px solid rgba(242, 239, 232, 0.14)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-mono text-[11px] tracking-[0.22em] uppercase"
          style={{ color: "#ff5b1f" }}
        >
          Your Action
        </h3>
        {callAmount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase"
            style={{
              border: "1px solid rgba(242, 239, 232, 0.14)",
              color: "#b8b4a8",
            }}
          >
            To Call
            <span style={{ color: "#ff5b1f" }}>
              {callAmount.toFixed(1)} BB
            </span>
          </span>
        )}
      </div>

      {/* Action buttons */}
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
              data-cursor-hover={!isDisabled}
              className="relative flex flex-col items-center justify-center gap-2 h-20 transition-colors"
              style={{
                background: isDisabled
                  ? "rgba(12, 14, 18, 0.4)"
                  : "rgba(7, 8, 10, 0.7)",
                border: isDisabled
                  ? "1px solid rgba(242, 239, 232, 0.04)"
                  : "1px solid rgba(242, 239, 232, 0.14)",
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isDisabled ? 0.25 : 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                delay: index * 0.04,
              }}
              whileHover={
                !isDisabled
                  ? {
                      y: -2,
                      scale: 1.03,
                      borderColor: "rgba(255, 91, 31, 0.5)",
                    }
                  : undefined
              }
              whileTap={!isDisabled ? { scale: 0.95 } : undefined}
            >
              <span
                className="transition-colors"
                style={{ color: isDisabled ? "#3a3d39" : btn.colour }}
              >
                {btn.icon}
              </span>
              <span
                className="font-mono text-[10px] tracking-[0.18em] uppercase transition-colors"
                style={{ color: isDisabled ? "#3a3d39" : btn.colour }}
              >
                {btn.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Keyboard shortcut hints */}
      <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
        {ACTION_BUTTONS.map((btn) => (
          <div key={btn.action} className="flex items-center gap-1.5">
            <kbd
              className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 font-mono text-[10px] leading-none"
              style={{
                background: "rgba(242, 239, 232, 0.06)",
                border: "1px solid rgba(242, 239, 232, 0.08)",
                color: "#b8b4a8",
              }}
            >
              {btn.shortcut}
            </kbd>
            <span
              className="text-[10px] font-mono tracking-[0.06em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              {btn.shortcutLabel}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ActionPanel;
