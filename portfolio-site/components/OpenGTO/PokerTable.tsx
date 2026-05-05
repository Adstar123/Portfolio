"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import PlayingCard from "./PlayingCard";
import PlayerSeat from "./PlayerSeat";
import type { Scenario, Position, Player } from "@/lib/opengto/types";
import { POSITIONS } from "@/lib/opengto/types";

interface PokerTableProps {
  scenario: Scenario | null;
  isAnimating: boolean;
}

// Visual positions around the table (percentage offsets from centre)
// Index 0 = hero (bottom centre), then clockwise
// Adjusted for larger table with wider spacing
const VISUAL_POSITIONS = [
  { x: 0, y: 52 }, // 0 — Hero (bottom centre)
  { x: -44, y: 28 }, // 1 — Bottom-left
  { x: -48, y: -10 }, // 2 — Left
  { x: -30, y: -44 }, // 3 — Top-left
  { x: 30, y: -44 }, // 4 — Top-right
  { x: 48, y: -10 }, // 5 — Right
];

const ACTION_REVEAL_DELAY = 350; // ms between each villain reveal

/**
 * Rotate the players array so the hero is always at visual index 0 (bottom centre).
 * Returns a new array with the hero first, then positions wrapping clockwise.
 */
function rotatePlayersToHero(
  players: Player[],
  heroPosition: Position
): Player[] {
  const heroIndex = POSITIONS.indexOf(heroPosition);
  if (heroIndex === -1) return players;

  // Build an ordered list starting from hero, wrapping around POSITIONS
  const ordered: Player[] = [];
  for (let i = 0; i < POSITIONS.length; i++) {
    const pos = POSITIONS[(heroIndex + i) % POSITIONS.length];
    const player = players.find((p) => p.position === pos);
    if (player) {
      ordered.push(player);
    }
  }
  return ordered;
}

const PokerTable: React.FC<PokerTableProps> = ({ scenario, isAnimating }) => {
  const [revealedPositions, setRevealedPositions] = useState<Set<Position>>(
    new Set()
  );
  const scenarioIdRef = useRef<string>("");

  // Create a stable ID for the scenario to detect changes
  const getScenarioId = (s: Scenario): string => {
    return `${s.heroPosition}-${s.heroCards.handType}-${s.pot}-${s.actions.length}`;
  };

  // Sequential villain action reveal — runs on mount AND when scenario changes
  useEffect(() => {
    if (!scenario) return;

    const currentId = getScenarioId(scenario);
    const isNewScenario = currentId !== scenarioIdRef.current;
    scenarioIdRef.current = currentId;

    // Get villain actions (non-hero players who have an action)
    const villainActions = scenario.players.filter(
      (p) => !p.isHero && p.action
    );

    if (isNewScenario) {
      // New scenario: reset and animate reveals sequentially
      setRevealedPositions(new Set());

      const timers: ReturnType<typeof setTimeout>[] = [];
      villainActions.forEach((player, index) => {
        const timer = setTimeout(() => {
          setRevealedPositions((prev) => {
            const next = new Set(prev);
            next.add(player.position);
            return next;
          });
        }, (index + 1) * ACTION_REVEAL_DELAY);
        timers.push(timer);
      });

      return () => {
        timers.forEach(clearTimeout);
      };
    } else {
      // Same scenario (e.g. remount after tab switch): reveal all immediately
      setRevealedPositions(
        new Set(villainActions.map((p) => p.position))
      );
    }
  }, [scenario]);

  if (!scenario) {
    return (
      <div className="relative w-full max-w-[800px] mx-auto aspect-[5/3]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[88%] h-[78%] rounded-[50%]"
            style={{
              background:
                "radial-gradient(ellipse at center, #0c0e12 0%, #07080a 70%)",
              border: "1px dashed rgba(255, 91, 31, 0.28)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      </div>
    );
  }

  const rotatedPlayers = rotatePlayersToHero(
    scenario.players,
    scenario.heroPosition
  );

  return (
    <div className="relative w-full max-w-[800px] mx-auto mb-12">
      {/* Ambient molten glow background */}
      <div
        className="absolute -inset-12 rounded-[50%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,91,31,0.10) 0%, rgba(255,91,31,0.04) 40%, transparent 70%)",
        }}
      />

      {/* Table container */}
      <div className="relative w-full aspect-[5/3]">
        {/* Oval table felt — dark ink with dashed molten ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[88%] h-[78%] rounded-[50%] relative overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(255,91,31,0.06) 0%, #0c0e12 60%, #07080a 100%)",
              boxShadow:
                "inset 0 0 80px rgba(0,0,0,0.6), 0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(242,239,232,0.08)",
            }}
          >
            {/* Dashed molten ring */}
            <div
              className="absolute inset-[14px] rounded-[50%] pointer-events-none"
              style={{
                border: "1px dashed rgba(255, 91, 31, 0.32)",
              }}
            />
          </div>
        </div>

        {/* Pot display — centred on table */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.pot}
              className="flex flex-col items-center gap-1 px-6 py-3 backdrop-blur-sm"
              style={{
                background: "rgba(7, 8, 10, 0.85)",
                border: "1px solid rgba(255, 91, 31, 0.5)",
                boxShadow:
                  "0 0 24px rgba(255, 91, 31, 0.15), 0 4px 20px rgba(0,0,0,0.4)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "#6e6b62" }}
              >
                POT
              </span>
              <span
                className="font-display text-2xl tabular-nums leading-none"
                style={{ color: "#ff5b1f", fontWeight: 500 }}
              >
                {scenario.pot.toFixed(1)} BB
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Player seats arranged around the table */}
        {rotatedPlayers.map((player, visualIndex) => {
          const pos = VISUAL_POSITIONS[visualIndex];
          if (!pos) return null;

          const isHero = player.isHero;
          const isRevealed = isHero || revealedPositions.has(player.position);

          return (
            <PlayerSeat
              key={player.position}
              position={player.position}
              action={player.action}
              isRevealed={isRevealed}
              isHero={isHero}
              offsetX={pos.x}
              offsetY={pos.y}
              delay={isHero ? 0 : visualIndex * 0.08}
            />
          );
        })}

        {/* Hero cards — overlapping the bottom of the felt */}
        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <PlayingCard
              card={scenario.heroCards.card1}
              index={0}
              isHero
            />
            <PlayingCard
              card={scenario.heroCards.card2}
              index={1}
              isHero
            />
          </div>

          {/* Hand type badge */}
          <motion.div
            className="px-3 py-1"
            style={{
              background: "rgba(7, 8, 10, 0.9)",
              border: "1px solid rgba(255, 91, 31, 0.4)",
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: 0.3,
            }}
          >
            <span
              className="font-mono text-[10px] tracking-[0.18em] uppercase"
              style={{ color: "#ff5b1f" }}
            >
              {scenario.heroCards.handType}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;
