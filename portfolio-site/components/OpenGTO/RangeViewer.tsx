"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, Loader2, BarChart3, Hand } from "lucide-react";
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
  CO: { x: 50, y: 15 },
  BTN: { x: 85, y: 35 },
  SB: { x: 85, y: 65 },
  BB: { x: 50, y: 85 },
};

const OPPONENT_ACTIONS: OpponentAction[] = ["fold", "call", "raise", "all-in"];

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

  return (
    <div className="relative w-full aspect-[4/3] bg-emerald-900/40 rounded-xl border border-emerald-800/30 overflow-hidden">
      {/* Felt ellipse */}
      <div
        className="absolute inset-[15%] rounded-[50%] border-2 border-emerald-700/50"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(34,197,94,0.1), transparent)",
        }}
      />

      {/* Position markers */}
      {POSITIONS.map((pos) => {
        const { x, y } = TABLE_POSITIONS[pos];
        const isHero = pos === heroPosition;
        const action = configMap[pos];
        const colour = POSITION_COLOURS[pos];

        return (
          <div
            key={pos}
            className="absolute flex flex-col items-center gap-0.5 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: isHero ? colour : `${colour}44`,
                color: isHero ? "#000" : colour,
                border: isHero ? `2px solid ${colour}` : `1px solid ${colour}66`,
                boxShadow: isHero ? `0 0 8px ${colour}66` : "none",
              }}
            >
              {pos}
            </div>
            {action && !isHero && (
              <span
                className="text-[8px] font-semibold uppercase px-1 rounded"
                style={{
                  color: OPPONENT_ACTION_COLOURS[action],
                  background: "rgba(0,0,0,0.4)",
                }}
              >
                {action === "all-in" ? "AI" : action[0].toUpperCase()}
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

  // Filter only non-zero actions
  const visible = items.filter((item) => strategy[item.key] > 0.005);

  return (
    <div className="flex flex-col gap-2">
      {visible.map(({ label, key, colour }) => {
        const pct = strategy[key] * 100;
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{label}</span>
              <span className="font-mono text-zinc-300">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: colour }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
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

  const visible = items.filter((item) => dist[item.key] > 0.5);

  return (
    <div className="flex flex-col gap-2">
      {visible.map(({ label, key, colour }) => {
        const pct = dist[key];
        return (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{label}</span>
              <span className="font-mono text-zinc-300">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: colour }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
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
      <div className="flex flex-wrap items-center gap-3 p-3 bg-zinc-900/60 backdrop-blur-sm rounded-xl border border-zinc-800/50">
        {/* Hero position selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-zinc-500 mr-1 font-medium">Hero:</span>
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setHeroPosition(pos)}
              className="px-2.5 py-1 text-xs font-bold rounded-md transition-all"
              style={{
                background:
                  heroPosition === pos
                    ? POSITION_COLOURS[pos]
                    : "rgba(255,255,255,0.05)",
                color: heroPosition === pos ? "#000" : POSITION_COLOURS[pos],
                border:
                  heroPosition === pos
                    ? `1px solid ${POSITION_COLOURS[pos]}`
                    : "1px solid transparent",
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-700" />

        {/* Opponent action configurator */}
        {positionConfigs.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            {positionConfigs.map((pc) => (
              <div key={pc.position} className="flex items-center gap-1">
                <span
                  className="text-xs font-bold mr-0.5"
                  style={{ color: POSITION_COLOURS[pc.position] }}
                >
                  {pc.position}:
                </span>
                {OPPONENT_ACTIONS.map((action) => (
                  <button
                    key={action}
                    onClick={() => setPositionAction(pc.position, action)}
                    className="px-1.5 py-0.5 text-[10px] font-semibold rounded transition-all uppercase"
                    style={{
                      background:
                        pc.action === action
                          ? OPPONENT_ACTION_COLOURS[action]
                          : "rgba(255,255,255,0.05)",
                      color:
                        pc.action === action
                          ? "#fff"
                          : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {action === "all-in" ? "AI" : action[0]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={computeRange}
          disabled={isLoading}
          className="ml-auto p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />
        </button>
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
        <div className="w-80 shrink-0 flex flex-col gap-3">
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
              Overview
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
          <div className="flex-1 bg-zinc-900/60 rounded-xl border border-zinc-800/50 p-4">
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
                  {/* Mini table */}
                  <MiniTable
                    heroPosition={heroPosition}
                    positionConfigs={positionConfigs}
                  />

                  {/* Distribution stats */}
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
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
                        <span className="text-xs text-zinc-500">
                          {selectedHand.length === 2
                            ? "Pair"
                            : selectedHand.endsWith("s")
                              ? "Suited"
                              : "Offsuit"}
                        </span>
                      </div>
                      <StrategyBars strategy={selectedStrategy} />
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
