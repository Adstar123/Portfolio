import { Card, HoleCards } from "./types";

export const RANKS = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"] as const;
export const SUITS: Card["suit"][] = ["spades", "hearts", "diamonds", "clubs"];

const RANK_VALUES: Record<string, number> = {
  "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
  T: 10, J: 11, Q: 12, K: 13, A: 14,
};

/** Get numeric value of a rank (2=2, A=14) */
export function rankValue(rank: string): number {
  return RANK_VALUES[rank] ?? 0;
}

/** Get hand type string: "AKs", "QQ", "72o" */
export function getHandType(card1: Card, card2: Card): string {
  const v1 = rankValue(card1.rank);
  const v2 = rankValue(card2.rank);
  const highRank = v1 >= v2 ? card1.rank : card2.rank;
  const lowRank = v1 >= v2 ? card2.rank : card1.rank;

  if (card1.rank === card2.rank) return `${highRank}${lowRank}`;
  const suited = card1.suit === card2.suit ? "s" : "o";
  return `${highRank}${lowRank}${suited}`;
}

/**
 * Get index (0-168) for a hand type in the 13x13 matrix.
 * Diagonal = pairs, upper triangle = suited, lower triangle = offsuit.
 * Matches Python: card.py hand_type_to_index()
 */
export function handTypeToIndex(handType: string): number {
  const ranks = "AKQJT98765432";
  if (handType.length === 2) {
    const idx = ranks.indexOf(handType[0]);
    return idx * 13 + idx;
  }
  const r1 = ranks.indexOf(handType[0]);
  const r2 = ranks.indexOf(handType[1]);
  if (handType[2] === "s") return Math.min(r1, r2) * 13 + Math.max(r1, r2);
  return Math.max(r1, r2) * 13 + Math.min(r1, r2);
}

/** Convert index (0-168) back to hand type string */
export function indexToHandType(index: number): string {
  const ranks = "AKQJT98765432";
  const row = Math.floor(index / 13);
  const col = index % 13;
  if (row === col) return `${ranks[row]}${ranks[col]}`;
  if (row < col) return `${ranks[row]}${ranks[col]}s`;
  return `${ranks[col]}${ranks[row]}o`;
}

/** Get all 169 hand types in matrix order */
export function getAllHandTypes(): string[] {
  const types: string[] = [];
  for (let i = 0; i < 169; i++) types.push(indexToHandType(i));
  return types;
}

/** Generate a random card not in the exclude list */
export function randomCard(exclude: Card[] = []): Card {
  let card: Card;
  do {
    card = {
      rank: RANKS[Math.floor(Math.random() * RANKS.length)],
      suit: SUITS[Math.floor(Math.random() * SUITS.length)],
    };
  } while (exclude.some((c) => c.rank === card.rank && c.suit === card.suit));
  return card;
}

/** Generate random hole cards */
export function randomHoleCards(): HoleCards {
  const card1 = randomCard();
  const card2 = randomCard([card1]);
  return { card1, card2, handType: getHandType(card1, card2) };
}

/** Create hole cards from a hand type string (e.g. "AKs" → random suited AK combo) */
export function holeCardsFromType(handType: string): HoleCards {
  const r1 = handType[0];
  const r2 = handType.length >= 2 ? handType[1] : r1;
  const isSuited = handType.length === 3 && handType[2] === "s";
  const isPair = r1 === r2;

  const suit1 = SUITS[Math.floor(Math.random() * 4)];
  let suit2: Card["suit"];

  if (isPair) {
    const otherSuits = SUITS.filter((s) => s !== suit1);
    suit2 = otherSuits[Math.floor(Math.random() * otherSuits.length)];
  } else if (isSuited) {
    suit2 = suit1;
  } else {
    const otherSuits = SUITS.filter((s) => s !== suit1);
    suit2 = otherSuits[Math.floor(Math.random() * otherSuits.length)];
  }

  const card1: Card = { rank: r1, suit: suit1 };
  const card2: Card = { rank: r2, suit: suit2 };
  return { card1, card2, handType: getHandType(card1, card2) };
}
