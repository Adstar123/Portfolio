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
        {/* Empty table state */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[88%] h-[78%] rounded-[50%] border-2 border-white/5"
            style={{
              background:
                "linear-gradient(145deg, #1a5c3a 0%, #0f4028 50%, #0a3020 100%)",
              boxShadow:
                "0 0 0 14px #4a3528, 0 0 0 18px #3d2a1f, 0 0 0 22px #261810, 0 0 0 24px rgba(0,0,0,0.5), 0 24px 80px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.3)",
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
      {/* Ambient green glow background */}
      <div
        className="absolute -inset-12 rounded-[50%] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(26,92,58,0.18) 0%, rgba(15,64,40,0.1) 40%, transparent 70%)",
        }}
      />

      {/* Table container — wider aspect ratio for more room */}
      <div className="relative w-full aspect-[5/3]">
        {/* Oval table felt */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[88%] h-[78%] rounded-[50%] relative overflow-hidden"
            style={{
              background:
                "linear-gradient(145deg, #1a5c3a 0%, #0f4028 50%, #0a3020 100%)",
              boxShadow:
                "0 0 0 14px #4a3528, 0 0 0 18px #3d2a1f, 0 0 0 22px #261810, 0 0 0 24px rgba(0,0,0,0.5), 0 24px 80px rgba(0,0,0,0.6), inset 0 0 80px rgba(0,0,0,0.3)",
            }}
          >
            {/* SVG noise texture overlay for felt effect */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <filter id="felt-noise">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.9"
                  numOctaves="4"
                  stitchTiles="stitch"
                />
                <feColorMatrix type="saturate" values="0" />
              </filter>
              <rect width="100%" height="100%" filter="url(#felt-noise)" />
            </svg>

            {/* Subtle inner edge highlight */}
            <div className="absolute inset-0 rounded-[50%] border border-white/[0.06]" />
          </div>
        </div>

        {/* Pot display — centred on table */}
        <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.pot}
              className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl bg-black/80 backdrop-blur-sm"
              style={{
                borderWidth: "1.5px",
                borderStyle: "solid",
                borderColor: "rgba(217, 163, 65, 0.5)",
                boxShadow:
                  "0 0 24px rgba(217, 163, 65, 0.12), 0 0 8px rgba(217, 163, 65, 0.06), 0 4px 20px rgba(0,0,0,0.4)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.15em]">
                POT
              </span>
              <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums leading-none">
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
            className="px-3 py-1 rounded-full bg-black/85 border border-white/10"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: 0.3,
            }}
          >
            <span className="text-xs font-semibold text-zinc-300 font-mono tracking-wide">
              {scenario.heroCards.handType}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PokerTable;
