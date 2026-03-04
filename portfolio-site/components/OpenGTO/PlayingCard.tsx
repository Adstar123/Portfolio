"use client";

import React from "react";
import { motion } from "motion/react";
import type { Card } from "@/lib/opengto/types";

interface PlayingCardProps {
  card: Card;
  index: number;
  isHero?: boolean;
  faceDown?: boolean;
  small?: boolean;
}

const SUIT_SYMBOLS: Record<Card["suit"], string> = {
  spades: "\u2660",
  hearts: "\u2665",
  diamonds: "\u2666",
  clubs: "\u2663",
};

const RED_SUITS: Set<Card["suit"]> = new Set(["hearts", "diamonds"]);

const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  index,
  isHero = false,
  faceDown = false,
  small = false,
}) => {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const isRed = RED_SUITS.has(card.suit);

  // Suit colour: red for hearts/diamonds, near-black for spades/clubs (on white card face)
  const suitColorClass = isRed ? "text-red-600" : "text-zinc-900";

  const cardVariants = {
    initial: {
      rotateY: 180,
      scale: 0.85,
      opacity: 0,
    },
    animate: {
      rotateY: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        delay: index * 0.12,
      },
    },
    hover: isHero
      ? {
          y: -6,
          scale: 1.03,
        }
      : {},
  };

  // Size classes based on variant
  const sizeClasses = small
    ? "w-[38px] h-[54px]"
    : isHero
      ? "w-[72px] h-[104px] cursor-pointer"
      : "w-16 h-[92px]";

  const rankSizeClass = small
    ? "text-[10px]"
    : isHero
      ? "text-[17px]"
      : "text-[15px]";

  const suitSizeClass = small
    ? "text-[9px]"
    : isHero
      ? "text-[15px]"
      : "text-[13px]";

  const centerSuitSizeClass = small
    ? "text-[16px]"
    : isHero
      ? "text-[34px]"
      : "text-[28px]";

  return (
    <motion.div
      className={`${sizeClasses} rounded-lg bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25),0_1px_3px_rgba(0,0,0,0.15)] relative cursor-default [transform-style:preserve-3d]`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      {faceDown ? (
        /* Card back */
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#2c3e50] to-[#1a252f] overflow-hidden">
          <div
            className="absolute inset-[3px] rounded-[5px] border border-white/15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)",
            }}
          />
        </div>
      ) : (
        /* Card face */
        <div className="absolute inset-0 rounded-lg bg-white p-[5px]">
          {/* Top-left corner */}
          <div className="absolute top-[5px] left-[5px] flex flex-col items-center leading-none">
            <span className={`${rankSizeClass} font-bold ${suitColorClass}`}>
              {card.rank}
            </span>
            <span className={`${suitSizeClass} ${suitColorClass} leading-none`}>
              {suitSymbol}
            </span>
          </div>

          {/* Centre suit */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className={`${centerSuitSizeClass} ${suitColorClass} opacity-85`}>
              {suitSymbol}
            </span>
          </div>

          {/* Bottom-right corner (rotated 180deg) */}
          <div className="absolute bottom-[5px] right-[5px] flex flex-col items-center leading-none rotate-180">
            <span className={`${rankSizeClass} font-bold ${suitColorClass}`}>
              {card.rank}
            </span>
            <span className={`${suitSizeClass} ${suitColorClass} leading-none`}>
              {suitSymbol}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PlayingCard;
