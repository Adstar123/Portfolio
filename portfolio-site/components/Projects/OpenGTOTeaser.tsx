"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircleUser } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Suit = "♠" | "♥" | "♦" | "♣";
type Card = { rank: string; suit: Suit };

type Position = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";

type VillainAction = "FOLD" | "CALL" | "RAISE" | "ALL-IN" | "POST";

type Action = "FOLD" | "CHECK" | "CALL" | "RAISE" | "ALL-IN";

type Seat = {
  pos: Position;
  isHero: boolean;
  action?: VillainAction;
  amount?: number;
  angle: number;
  // True for blind posts that are visible from the start (not animated)
  isPost?: boolean;
};

type Scenario = {
  hero: Card[];
  handLabel: string;
  heroPos: Position;
  pot: number;
  toCall: number;
  villains: { pos: Position; action: VillainAction; amount?: number }[];
  // Legal actions for the hero in this spot
  legal: Action[];
  // The Nash-correct play
  verdict: Action;
  bbSizing: string;
  // Short Nash explanation
  reason: string;
};

// ─── Scenarios ──────────────────────────────────────────────────────────────
// Only include actions for players who have ACTED before the hero. Players
// yet-to-act show no badge. Blinds auto-show their forced posts (0.5BB / 1BB)
// in buildSeats when they haven't acted voluntarily.

const SCENARIOS: Scenario[] = [
  // 1. AKo on BTN, HJ raised. Acted before hero: UTG fold, HJ raise, CO fold.
  // SB + BB haven't acted (they post blinds).
  {
    hero: [
      { rank: "A", suit: "♠" },
      { rank: "K", suit: "♥" },
    ],
    handLabel: "AKo",
    heroPos: "BTN",
    pot: 4.0,
    toCall: 2.5,
    villains: [
      { pos: "UTG", action: "FOLD" },
      { pos: "HJ", action: "RAISE", amount: 2.5 },
      { pos: "CO", action: "FOLD" },
    ],
    legal: ["FOLD", "CALL", "RAISE", "ALL-IN"],
    verdict: "RAISE",
    bbSizing: "9 BB",
    reason: "AKo 3-bets BTN vs HJ open for value + initiative.",
  },
  // 2. 99 on CO, UTG + HJ folded.
  {
    hero: [
      { rank: "9", suit: "♣" },
      { rank: "9", suit: "♦" },
    ],
    handLabel: "99",
    heroPos: "CO",
    pot: 1.5,
    toCall: 0,
    villains: [
      { pos: "UTG", action: "FOLD" },
      { pos: "HJ", action: "FOLD" },
    ],
    legal: ["FOLD", "RAISE", "ALL-IN"],
    verdict: "RAISE",
    bbSizing: "2.5 BB",
    reason: "99 is a clear open from the CO with the BTN behind.",
  },
  // 3. 72o on UTG, hero is first to act. No one has acted.
  {
    hero: [
      { rank: "7", suit: "♠" },
      { rank: "2", suit: "♦" },
    ],
    handLabel: "72o",
    heroPos: "UTG",
    pot: 1.5,
    toCall: 0,
    villains: [],
    legal: ["FOLD", "RAISE", "ALL-IN"],
    verdict: "FOLD",
    bbSizing: "—",
    reason: "72o is the worst starting hand. Always fold UTG.",
  },
  // 4. QJs on BTN, CO opened.
  {
    hero: [
      { rank: "Q", suit: "♥" },
      { rank: "J", suit: "♥" },
    ],
    handLabel: "QJs",
    heroPos: "BTN",
    pot: 4.0,
    toCall: 2.5,
    villains: [
      { pos: "UTG", action: "FOLD" },
      { pos: "HJ", action: "FOLD" },
      { pos: "CO", action: "RAISE", amount: 2.5 },
    ],
    legal: ["FOLD", "CALL", "RAISE", "ALL-IN"],
    verdict: "CALL",
    bbSizing: "2.5 BB",
    reason: "QJs flats BTN vs CO — stay in position with playability.",
  },
  // 5. AA on HJ, UTG opened.
  {
    hero: [
      { rank: "A", suit: "♣" },
      { rank: "A", suit: "♦" },
    ],
    handLabel: "AA",
    heroPos: "HJ",
    pot: 4.0,
    toCall: 2.5,
    villains: [{ pos: "UTG", action: "RAISE", amount: 2.5 }],
    legal: ["FOLD", "CALL", "RAISE", "ALL-IN"],
    verdict: "RAISE",
    bbSizing: "9 BB",
    reason: "Pocket aces always 3-bet for value vs UTG opener.",
  },
  // 6. T9s on CO, UTG + HJ folded.
  {
    hero: [
      { rank: "T", suit: "♣" },
      { rank: "9", suit: "♣" },
    ],
    handLabel: "T9s",
    heroPos: "CO",
    pot: 1.5,
    toCall: 0,
    villains: [
      { pos: "UTG", action: "FOLD" },
      { pos: "HJ", action: "FOLD" },
    ],
    legal: ["FOLD", "RAISE", "ALL-IN"],
    verdict: "RAISE",
    bbSizing: "2.5 BB",
    reason: "T9s is a strong CO open — connectivity + suitedness.",
  },
  // 7. K7o on BB, all fold around to SB who limped.
  {
    hero: [
      { rank: "K", suit: "♣" },
      { rank: "7", suit: "♥" },
    ],
    handLabel: "K7o",
    heroPos: "BB",
    pot: 2.0,
    toCall: 0,
    villains: [
      { pos: "UTG", action: "FOLD" },
      { pos: "HJ", action: "FOLD" },
      { pos: "CO", action: "FOLD" },
      { pos: "BTN", action: "FOLD" },
      { pos: "SB", action: "CALL", amount: 0.5 },
    ],
    legal: ["CHECK", "RAISE", "ALL-IN"],
    verdict: "CHECK",
    bbSizing: "—",
    reason: "BB checks with marginal hand vs SB limp — see a free flop.",
  },
];

const ALL_ACTIONS: Action[] = ["FOLD", "CHECK", "CALL", "RAISE", "ALL-IN"];

// Visual layout: 6 seats around an oval. Hero always at bottom (angle 0).
const SEAT_ANGLES: Record<Position, number> = {
  BTN: 0,
  CO: 60,
  HJ: 120,
  UTG: 180,
  BB: 300,
  SB: 240,
};

const POS_LABEL: Record<Position, string> = {
  UTG: "Under the Gun",
  HJ: "Hijack",
  CO: "Cutoff",
  BTN: "Button",
  SB: "Small Blind",
  BB: "Big Blind",
};

// ─── Build seats from scenario ───────────────────────────────────────────────

function buildSeats(scenario: Scenario): Seat[] {
  const heroAngle = SEAT_ANGLES[scenario.heroPos];
  const all: Position[] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
  const villainMap = new Map<Position, { action: VillainAction; amount?: number }>();
  scenario.villains.forEach((v) => villainMap.set(v.pos, v));

  return all.map((pos) => {
    const isHero = pos === scenario.heroPos;
    const v = villainMap.get(pos);
    const baseAngle = SEAT_ANGLES[pos];
    let angle = baseAngle - heroAngle;
    while (angle < 0) angle += 360;

    // If a blind hasn't taken a voluntary action yet, show their forced post
    let action = v?.action;
    let amount = v?.amount;
    let isPost = false;
    if (!isHero && !action) {
      if (pos === "SB") {
        action = "POST";
        amount = 0.5;
        isPost = true;
      } else if (pos === "BB") {
        action = "POST";
        amount = 1.0;
        isPost = true;
      }
    }

    return {
      pos,
      isHero,
      action,
      amount,
      angle: angle / 360,
      isPost,
    };
  });
}

function seatPosition(angle: number): { left: string; top: string } {
  const a = (angle - 0.25) * Math.PI * 2;
  const radiusX = 42;
  const radiusY = 36;
  const x = 50 + Math.cos(a) * radiusX;
  const y = 50 - Math.sin(a) * radiusY;
  return { left: `${x}%`, top: `${y}%` };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OpenGTOTeaser() {
  const [idx, setIdx] = useState(0);
  const scenario = SCENARIOS[idx];
  const seats = buildSeats(scenario);

  const [pickedAction, setPickedAction] = useState<Action | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [revealedSeats, setRevealedSeats] = useState<Set<Position>>(new Set());
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Blind posts are visible from the start; villain actions reveal sequentially.
    const initial = new Set<Position>();
    if (!scenario.villains.find((v) => v.pos === "SB") && scenario.heroPos !== "SB") {
      initial.add("SB");
    }
    if (!scenario.villains.find((v) => v.pos === "BB") && scenario.heroPos !== "BB") {
      initial.add("BB");
    }
    setRevealedSeats(initial);
    setPickedAction(null);
    setRevealed(false);
    const villainsInOrder = scenario.villains;
    const timers: ReturnType<typeof setTimeout>[] = [];
    villainsInOrder.forEach((v, i) => {
      timers.push(
        setTimeout(() => {
          setRevealedSeats((prev) => {
            const next = new Set(prev);
            next.add(v.pos);
            return next;
          });
        }, 250 + i * 240)
      );
    });
    return () => timers.forEach(clearTimeout);
  }, [idx, scenario]);

  function deal() {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    setIdx((i) => (i + 1) % SCENARIOS.length);
  }

  function pick(a: Action) {
    if (revealed) return;
    if (!scenario.legal.includes(a)) return;
    setPickedAction(a);
    setTimeout(() => setRevealed(true), 350);
  }

  useEffect(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (revealed) {
      autoTimer.current = setTimeout(deal, 5500);
    } else if (!pickedAction) {
      autoTimer.current = setTimeout(deal, 11000);
    }
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, pickedAction, idx]);

  const userCorrect = pickedAction === scenario.verdict;
  const ctxLabel =
    scenario.toCall > 0
      ? `vs ${scenario.toCall.toFixed(1)}BB open`
      : "first to act";

  return (
    <div
      className="relative w-full h-full flex flex-col"
      onMouseEnter={() => {
        if (autoTimer.current) clearTimeout(autoTimer.current);
      }}
    >
      {/* Top bar: action + context */}
      <div
        className="flex items-center justify-between px-4 py-2.5 font-mono text-[9px] tracking-[0.22em] uppercase"
        style={{
          color: "#6e6b62",
          borderBottom: "1px solid rgba(242, 239, 232, 0.06)",
        }}
      >
        <span>PRJ/01 · OPENGTO · LIVE</span>
        <span style={{ color: "#ff5b1f" }}>
          POT {scenario.pot.toFixed(1)} BB
        </span>
      </div>

      {/* Hero context strip — clear who you are + situation */}
      <div
        className="flex items-center justify-between px-4 py-2 font-mono text-[10px] tracking-[0.18em] uppercase"
        style={{
          background: "rgba(255, 91, 31, 0.06)",
          borderBottom: "1px solid rgba(255, 91, 31, 0.2)",
        }}
      >
        <span style={{ color: "#ff5b1f" }}>
          You are <strong>{scenario.heroPos}</strong> · {POS_LABEL[scenario.heroPos]}
        </span>
        <span style={{ color: "#b8b4a8" }}>
          {scenario.handLabel} · {ctxLabel}
        </span>
      </div>

      {/* Felt + seats area */}
      <div
        className="relative flex-1"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(255,91,31,0.10) 0%, rgba(12,14,18,0.4) 60%)",
          minHeight: 320,
        }}
      >
        {/* Oval felt */}
        <div
          className="absolute inset-x-[8%] inset-y-[15%] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(255,91,31,0.08) 0%, #0c0e12 60%, #07080a 100%)",
            border: "1px dashed rgba(255, 91, 31, 0.32)",
            boxShadow: "inset 0 0 50px rgba(0,0,0,0.5)",
          }}
        />

        {/* Pot label centre */}
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 z-20 text-center">
          <div
            className="font-mono text-[9px] tracking-[0.22em] uppercase"
            style={{ color: "#6e6b62" }}
          >
            Pot
          </div>
          <div
            className="font-display"
            style={{
              color: "#ff5b1f",
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            {scenario.pot.toFixed(1)}
          </div>
        </div>

        {/* Villain seats */}
        {seats
          .filter((s) => !s.isHero)
          .map((seat) => {
            const { left, top } = seatPosition(seat.angle);
            const isRevealed = revealedSeats.has(seat.pos);
            const folded = seat.action === "FOLD";
            return (
              <div
                key={seat.pos}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                style={{ left, top, opacity: folded && isRevealed ? 0.4 : 1 }}
              >
                <div
                  className="flex items-center gap-1 px-2 py-0.5"
                  style={{
                    background: "rgba(7, 8, 10, 0.92)",
                    border: "1px solid rgba(242, 239, 232, 0.12)",
                  }}
                >
                  <CircleUser
                    size={9}
                    strokeWidth={1.6}
                    style={{ color: "#6e6b62" }}
                  />
                  <span
                    className="font-mono text-[9px] tracking-[0.18em] uppercase"
                    style={{ color: "#b8b4a8" }}
                  >
                    {seat.pos}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {isRevealed && seat.action && (
                    <motion.div
                      key={seat.action}
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      className="flex flex-col items-center px-2 py-[3px] min-w-[44px]"
                      style={{
                        background:
                          seat.action === "ALL-IN"
                            ? "#ff5b1f"
                            : "rgba(7, 8, 10, 0.92)",
                        border:
                          seat.action === "RAISE"
                            ? "1px solid rgba(255, 91, 31, 0.7)"
                            : seat.action === "CALL"
                            ? "1px solid rgba(255, 133, 81, 0.5)"
                            : seat.action === "ALL-IN"
                            ? "1px solid #ff5b1f"
                            : seat.action === "POST"
                            ? "1px dashed rgba(255, 133, 81, 0.4)"
                            : "1px solid rgba(242, 239, 232, 0.18)",
                      }}
                    >
                      <span
                        className="font-mono text-[8px] tracking-[0.16em] uppercase leading-tight"
                        style={{
                          color:
                            seat.action === "RAISE"
                              ? "#ff5b1f"
                              : seat.action === "CALL"
                              ? "#ff8551"
                              : seat.action === "ALL-IN"
                              ? "#07080a"
                              : seat.action === "POST"
                              ? "#ff8551"
                              : "#6e6b62",
                        }}
                      >
                        {seat.action === "POST"
                          ? `${seat.pos} POST`
                          : seat.action}
                      </span>
                      {seat.amount != null && seat.action !== "FOLD" && (
                        <span
                          className="font-mono text-[8px] tabular-nums leading-tight"
                          style={{
                            color:
                              seat.action === "ALL-IN" ? "#07080a" : "#b8b4a8",
                          }}
                        >
                          {seat.amount.toFixed(1)}bb
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

        {/* Hero seat marker (ring around hero position) — visual cue you sit there */}
        {(() => {
          const heroSeat = seats.find((s) => s.isHero);
          if (!heroSeat) return null;
          const { left, top } = seatPosition(heroSeat.angle);
          return (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left, top, zIndex: 5 }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  border: "1px dashed rgba(255, 91, 31, 0.5)",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }}
              />
            </div>
          );
        })()}

        {/* Hero hole cards */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[8px] z-30 flex flex-col items-center gap-1.5">
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.handLabel}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              {scenario.hero.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -30, rotate: i === 0 ? -8 : 8, opacity: 0 }}
                  animate={{
                    y: 0,
                    rotate: i === 0 ? -3 : 3,
                    opacity: 1,
                  }}
                  transition={{
                    delay: i * 0.1,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col justify-between rounded-md"
                  style={{
                    width: 52,
                    height: 72,
                    background: "#f2efe8",
                    color:
                      c.suit === "♥" || c.suit === "♦" ? "#c5453a" : "#0c0e12",
                    padding: "7px 8px",
                    fontWeight: 600,
                    fontSize: 20,
                    lineHeight: 1,
                    boxShadow:
                      "0 12px 30px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(0,0,0,0.08)",
                    fontFamily: "var(--font-space-grotesk)",
                  }}
                >
                  <span>{c.rank}</span>
                  <span style={{ alignSelf: "flex-end", fontSize: 14 }}>
                    {c.suit}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Verdict strip */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2"
            style={{
              borderTop: "1px solid rgba(242, 239, 232, 0.06)",
              background: "rgba(7, 8, 10, 0.6)",
            }}
          >
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "#6e6b62" }}
            >
              Nash → {scenario.verdict}
              {scenario.bbSizing !== "—" && ` · ${scenario.bbSizing}`}
            </span>
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: userCorrect ? "#ff5b1f" : "#e0664f" }}
            >
              You: {pickedAction} · {userCorrect ? "Correct" : "Off-strategy"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar — only legal actions enabled */}
      <div
        className="grid grid-cols-5 gap-px"
        style={{ background: "rgba(242, 239, 232, 0.06)" }}
      >
        {ALL_ACTIONS.map((a) => {
          const legal = scenario.legal.includes(a);
          const isPicked = pickedAction === a;
          const isCorrectAfterReveal = revealed && a === scenario.verdict;
          return (
            <button
              key={a}
              type="button"
              onClick={() => pick(a)}
              disabled={revealed || !legal}
              className="py-3 font-mono text-[9px] tracking-[0.16em] uppercase transition-all"
              style={{
                background: isCorrectAfterReveal
                  ? "rgba(255,91,31,0.18)"
                  : isPicked
                  ? "rgba(255,91,31,0.10)"
                  : "rgba(12,14,18,0.7)",
                color: !legal
                  ? "#3a3d39"
                  : isCorrectAfterReveal
                  ? "#ff5b1f"
                  : isPicked
                  ? "#ff8551"
                  : "#b8b4a8",
                cursor: !legal || revealed ? "not-allowed" : "pointer",
                opacity: !legal ? 0.35 : 1,
              }}
            >
              {a}
            </button>
          );
        })}
      </div>

      {/* Reason + footer */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2 font-mono text-[10px] leading-relaxed"
            style={{
              color: "#b8b4a8",
              borderTop: "1px solid rgba(242, 239, 232, 0.06)",
            }}
          >
            <span style={{ color: "#ff5b1f" }}>WHY: </span>
            {scenario.reason}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex items-center justify-between px-4 py-2 font-mono text-[9px] tracking-[0.2em] uppercase"
        style={{
          color: "#6e6b62",
          borderTop: "1px solid rgba(242, 239, 232, 0.06)",
        }}
      >
        <span>
          Hand {idx + 1} / {SCENARIOS.length}
        </span>
        <button
          type="button"
          onClick={deal}
          className="transition-colors hover:opacity-80"
          style={{ color: "#ff5b1f" }}
        >
          Next ↻
        </button>
      </div>
    </div>
  );
}
