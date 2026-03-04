"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, BarChart3, Hand } from "lucide-react";
import RangeMatrix from "./RangeMatrix";
import { getRangeStrategy } from "@/lib/opengto/useGtoTrainer";
import { ActionType } from "@/lib/opengto/types";
import type {
  Position,
  RangeData,
  GTOStrategy,
  ActionDistribution,
} from "@/lib/opengto/types";
import type { ActionHistoryEntry } from "@/lib/opengto/featureVector";
import { POSITIONS } from "@/lib/opengto/types";

// ─── Types ──────────────────────────────────────────────────────────────────

type OpponentAction = "fold" | "call" | "raise" | "all-in";

interface PositionConfig {
  position: Position;
  action: OpponentAction;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const POSITION_COLOURS: Record<Position, string> = {
  UTG: "#ef4444",
  HJ: "#f97316",
  CO: "#eab308",
  BTN: "#22c55e",
  SB: "#3b82f6",
  BB: "#8b5cf6",
};

const ACTION_COLORS: Record<string, string> = {
  fold: "#3b82f6",
  check: "#22c55e",
  call: "#22c55e",
  raise: "#f97316",
  allIn: "#ef4444",
};

const TABLE_POSITIONS: Record<Position, { x: number; y: number }> = {
  UTG: { x: 15, y: 65 },
  HJ: { x: 15, y: 35 },
  CO: { x: 50, y: 12 },
  BTN: { x: 85, y: 35 },
  SB: { x: 85, y: 65 },
  BB: { x: 50, y: 88 },
};

const OPPONENT_ACTIONS: OpponentAction[] = ["fold", "call", "raise", "all-in"];

const OPPONENT_ACTION_LABELS: Record<OpponentAction, string> = {
  fold: "F",
  call: "C",
  raise: "R",
  "all-in": "A",
};

const OPPONENT_ACTION_COLOURS: Record<OpponentAction, string> = {
  fold: "#6b7280",
  call: "#22c55e",
  raise: "#f97316",
  "all-in": "#ef4444",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeDistribution(rangeData: RangeData): ActionDistribution {
  const dist: ActionDistribution = { fold: 0, check: 0, call: 0, raise: 0, allIn: 0 };
  const entries = Object.values(rangeData);
  if (entries.length === 0) return dist;

  for (const strat of entries) {
    dist.fold += strat.fold;
    dist.check += strat.check;
    dist.call += strat.call;
    dist.raise += strat.raise;
    dist.allIn += strat.allIn;
  }

  // Normalise to percentages
  const total = dist.fold + dist.check + dist.call + dist.raise + dist.allIn;
  if (total > 0) {
    dist.fold = (dist.fold / total) * 100;
    dist.check = (dist.check / total) * 100;
    dist.call = (dist.call / total) * 100;
    dist.raise = (dist.raise / total) * 100;
    dist.allIn = (dist.allIn / total) * 100;
  }
  return dist;
}

function computePot(positionConfigs: PositionConfig[]): string {
  // SB = 0.5, BB = 1.0 base
  let pot = 1.5;
  for (const pc of positionConfigs) {
    if (pc.action === "call") pot += 1.0;
    else if (pc.action === "raise") pot += 2.5;
    else if (pc.action === "all-in") pot += 100;
  }
  return pot.toFixed(1);
}

// ─── Mini Table Component ───────────────────────────────────────────────────

function MiniTable({
  heroPosition,
  positionConfigs,
}: {
  heroPosition: Position;
  positionConfigs: PositionConfig[];
}) {
  const configMap = useMemo(() => {
    const map: Partial<Record<Position, OpponentAction>> = {};
    for (const pc of positionConfigs) map[pc.position] = pc.action;
    return map;
  }, [positionConfigs]);

  const pot = computePot(positionConfigs);

  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950/60">
      {/* Felt ellipse */}
      <div
        className="absolute inset-[12%] rounded-[50%]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.15), rgba(22,163,74,0.06))",
          border: "1.5px solid rgba(34,197,94,0.25)",
        }}
      />

      {/* Pot label in centre */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-semibold uppercase tracking-widest text-emerald-500/70">
            Pot
          </span>
          <span className="text-sm font-bold text-emerald-400">
            {pot} BB
          </span>
        </div>
      </div>

      {/* Position markers */}
      {POSITIONS.map((pos) => {
        const { x, y } = TABLE_POSITIONS[pos];
        const isHero = pos === heroPosition;
        const action = configMap[pos];
        const colour = POSITION_COLOURS[pos];

        // Determine marker label
        const marker: string = isHero ? "?" : pos;

        // Determine action indicator
        let actionLabel: string | null = null;
        if (!isHero && action) {
          if (action === "fold") actionLabel = "F";
          else if (action === "call") actionLabel = "C";
          else if (action === "raise") actionLabel = "R";
          else if (action === "all-in") actionLabel = "A";
        }

        const isFolded = !isHero && action === "fold";

        return (
          <div
            key={pos}
            className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
              style={{
                background: isHero
                  ? colour
                  : isFolded
                    ? "rgba(107,114,128,0.2)"
                    : `${colour}33`,
                color: isHero
                  ? "#000"
                  : isFolded
                    ? "#6b7280"
                    : colour,
                border: isHero
                  ? `2px solid ${colour}`
                  : isFolded
                    ? "1px solid rgba(107,114,128,0.3)"
                    : `1.5px solid ${colour}88`,
                boxShadow: isHero ? `0 0 10px ${colour}55` : "none",
                opacity: isFolded ? 0.5 : 1,
              }}
            >
              {marker}
            </div>
            {actionLabel && (
              <span
                className="text-[8px] font-bold uppercase leading-none"
                style={{
                  color: OPPONENT_ACTION_COLOURS[action!],
                }}
              >
                {actionLabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Strategy Bars (for hand detail) ────────────────────────────────────────

function StrategyBars({ strategy }: { strategy: GTOStrategy }) {
  const items: { label: string; key: keyof GTOStrategy; colour: string }[] = [
    { label: "Fold", key: "fold", colour: ACTION_COLORS.fold },
    { label: "Check", key: "check", colour: ACTION_COLORS.check },
    { label: "Call", key: "call", colour: ACTION_COLORS.call },
    { label: "Raise", key: "raise", colour: ACTION_COLORS.raise },
    { label: "All-In", key: "allIn", colour: ACTION_COLORS.allIn },
  ];

  // Filter only non-zero actions and sort descending
  const visible = items
    .filter((item) => strategy[item.key] > 0.005)
    .sort((a, b) => strategy[b.key] - strategy[a.key]);

  return (
    <div className="flex flex-col gap-1">
      {visible.map(({ label, key, colour }) => {
        const pct = strategy[key] * 100;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center py-1.5 px-2 rounded-md"
            style={{ borderLeft: `3px solid ${colour}` }}
          >
            <span className="text-xs text-zinc-300 flex-1">{label}</span>
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: colour }}
            >
              {pct.toFixed(1)}%
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Distribution Stats ─────────────────────────────────────────────────────

function DistributionStats({ dist }: { dist: ActionDistribution }) {
  const items: { label: string; key: keyof ActionDistribution; colour: string }[] = [
    { label: "Fold", key: "fold", colour: ACTION_COLORS.fold },
    { label: "Check", key: "check", colour: ACTION_COLORS.check },
    { label: "Call", key: "call", colour: ACTION_COLORS.call },
    { label: "Raise", key: "raise", colour: ACTION_COLORS.raise },
    { label: "All-In", key: "allIn", colour: ACTION_COLORS.allIn },
  ];

  // Filter >0.5% and sort descending
  const visible = items
    .filter((item) => dist[item.key] > 0.5)
    .sort((a, b) => dist[b.key] - dist[a.key]);

  return (
    <div className="flex flex-col gap-1">
      {visible.map(({ label, key, colour }) => {
        const pct = dist[key];
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center py-1.5 px-2 rounded-md"
            style={{ borderLeft: `3px solid ${colour}` }}
          >
            <span className="text-xs text-zinc-300 flex-1">{label}</span>
            <span
              className="text-xs font-mono font-semibold"
              style={{ color: colour }}
            >
              {pct.toFixed(1)}%
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RangeViewer() {
  const [heroPosition, setHeroPosition] = useState<Position>("BTN");
  const [positionConfigs, setPositionConfigs] = useState<PositionConfig[]>([]);
  const [rangeData, setRangeData] = useState<RangeData>({});
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sideView, setSideView] = useState<"overview" | "detail">("overview");
  const computeRef = useRef(0);

  // Active positions = positions before hero in preflop order, excluding SB and BB
  const activePositions = useMemo(() => {
    const heroIndex = POSITIONS.indexOf(heroPosition);
    return POSITIONS.filter((_, idx) => idx < heroIndex).filter(
      (p) => p !== "SB" && p !== "BB"
    );
  }, [heroPosition]);

  // Reset position configs when hero position changes
  useEffect(() => {
    setPositionConfigs(
      activePositions.map((p) => ({ position: p, action: "fold" as OpponentAction }))
    );
  }, [activePositions]);

  // Compute range data on config change
  const computeRange = useCallback(async () => {
    const computeId = ++computeRef.current;
    setIsLoading(true);

    try {
      // Convert position configs to ActionHistoryEntry[]
      const actionHistory: ActionHistoryEntry[] = positionConfigs.map((p) => ({
        position: p.position,
        actionType:
          p.action === "fold"
            ? ActionType.FOLD
            : p.action === "call"
              ? ActionType.CALL
              : p.action === "raise"
                ? ActionType.RAISE
                : ActionType.ALL_IN,
        amount:
          p.action === "raise" ? 2.5 : p.action === "call" ? 1.0 : 0,
      }));

      const data = await getRangeStrategy(heroPosition, actionHistory);

      // Only apply if this is still the latest computation
      if (computeId === computeRef.current) {
        setRangeData(data);
      }
    } catch (err) {
      console.error("Failed to compute range:", err);
    } finally {
      if (computeId === computeRef.current) {
        setIsLoading(false);
      }
    }
  }, [heroPosition, positionConfigs]);

  // Auto-compute on mount and config change
  useEffect(() => {
    computeRange();
  }, [computeRange]);

  // Update a single position config action
  const setPositionAction = useCallback(
    (position: Position, action: OpponentAction) => {
      setPositionConfigs((prev) =>
        prev.map((pc) => (pc.position === position ? { ...pc, action } : pc))
      );
    },
    []
  );

  // Action distribution for overview
  const distribution = useMemo(() => computeDistribution(rangeData), [rangeData]);

  // Selected hand strategy
  const selectedStrategy = selectedHand ? rangeData[selectedHand] : null;

  // Switch to detail view when a hand is selected
  useEffect(() => {
    if (selectedHand && rangeData[selectedHand]) {
      setSideView("detail");
    }
  }, [selectedHand, rangeData]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ── Top Action Bar ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4 p-3 bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-800/50">
        {/* Hero position selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Your Position
          </span>
          <div className="flex items-center gap-1">
            {POSITIONS.map((pos) => {
              const isSelected = heroPosition === pos;
              return (
                <button
                  key={pos}
                  onClick={() => setHeroPosition(pos)}
                  className="px-2.5 py-1 text-xs font-bold rounded-md transition-all"
                  style={{
                    background: isSelected
                      ? POSITION_COLOURS[pos]
                      : "transparent",
                    color: isSelected ? "#000" : POSITION_COLOURS[pos],
                    border: `1.5px solid ${isSelected ? POSITION_COLOURS[pos] : `${POSITION_COLOURS[pos]}55`}`,
                  }}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        </div>

        {/* Opponent action configurator */}
        {positionConfigs.length > 0 && (
          <>
            {/* Divider */}
            <div className="w-px h-10 bg-zinc-700/60 self-center" />

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Opponent Actions
              </span>
              <div className="flex items-center gap-3">
                {positionConfigs.map((pc) => (
                  <div key={pc.position} className="flex items-center gap-1">
                    <span
                      className="text-xs font-bold mr-0.5"
                      style={{ color: POSITION_COLOURS[pc.position] }}
                    >
                      {pc.position}:
                    </span>
                    {OPPONENT_ACTIONS.map((action) => {
                      const isActive = pc.action === action;
                      return (
                        <button
                          key={action}
                          onClick={() => setPositionAction(pc.position, action)}
                          className="w-6 h-6 text-[10px] font-bold rounded transition-all flex items-center justify-center"
                          style={{
                            background: isActive
                              ? OPPONENT_ACTION_COLOURS[action]
                              : "transparent",
                            color: isActive
                              ? "#fff"
                              : "rgba(255,255,255,0.35)",
                            border: isActive
                              ? `1.5px solid ${OPPONENT_ACTION_COLOURS[action]}`
                              : "1.5px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {OPPONENT_ACTION_LABELS[action]}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Main Area ──────────────────────────────────────────────────── */}
      <div className="flex gap-4 w-full">
        {/* Left: Range Matrix */}
        <div className="flex-1 min-w-0 relative">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={24} className="animate-spin text-amber-400" />
                <span className="text-xs text-zinc-400">
                  Computing range...
                </span>
              </div>
            </div>
          )}
          <RangeMatrix
            rangeData={rangeData}
            selectedHand={selectedHand}
            onHandSelect={setSelectedHand}
          />
        </div>

        {/* Right: Side Panel */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          {/* Tab switcher */}
          <div className="flex bg-zinc-900/60 rounded-lg p-0.5 border border-zinc-800/50">
            <button
              onClick={() => setSideView("overview")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sideView === "overview"
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              <BarChart3 size={12} />
              Table View
            </button>
            <button
              onClick={() => setSideView("detail")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                sideView === "detail"
                  ? "bg-zinc-800 text-zinc-200"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              <Hand size={12} />
              Hand Detail
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 bg-zinc-900/60 rounded-xl border border-zinc-800/50 p-4 overflow-hidden">
            <AnimatePresence mode="wait">
              {sideView === "overview" ? (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {/* Table View header */}
                  <div className="flex items-center gap-1.5">
                    <BarChart3 size={13} className="text-zinc-500" />
                    <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">
                      Table View
                    </h3>
                  </div>

                  {/* Mini table */}
                  <MiniTable
                    heroPosition={heroPosition}
                    positionConfigs={positionConfigs}
                  />

                  {/* Distribution stats */}
                  <div>
                    <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                      Action Distribution
                    </h3>
                    <DistributionStats dist={distribution} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {selectedHand && selectedStrategy ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">
                          {selectedHand}
                        </span>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                          {selectedHand.length === 2
                            ? "Pair"
                            : selectedHand.endsWith("s")
                              ? "Suited"
                              : "Offsuit"}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
                          Strategy Breakdown
                        </h3>
                        <StrategyBars strategy={selectedStrategy} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                      <Hand size={32} className="mb-2 opacity-40" />
                      <p className="text-xs text-center">
                        Select a hand from the matrix to see its strategy
                        breakdown.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
