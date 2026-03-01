// Positions in 6-max poker (in preflop action order)
export type Position = "UTG" | "HJ" | "CO" | "BTN" | "SB" | "BB";

export const POSITIONS: Position[] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];
export const PREFLOP_ORDER: Position[] = ["UTG", "HJ", "CO", "BTN", "SB", "BB"];

// Action types — indices match the neural network output
export enum ActionType {
  FOLD = 0,
  CHECK = 1,
  CALL = 2,
  BET = 3,
  RAISE = 4,
  ALL_IN = 5,
}

export const ACTION_LABELS: Record<ActionType, string> = {
  [ActionType.FOLD]: "Fold",
  [ActionType.CHECK]: "Check",
  [ActionType.CALL]: "Call",
  [ActionType.BET]: "Bet",
  [ActionType.RAISE]: "Raise",
  [ActionType.ALL_IN]: "All-In",
};

// UI action type (simplified — maps BET to RAISE for display)
export type UIActionType = "fold" | "check" | "call" | "raise" | "all-in";

export const UI_TO_ACTION: Record<UIActionType, ActionType[]> = {
  fold: [ActionType.FOLD],
  check: [ActionType.CHECK],
  call: [ActionType.CALL],
  raise: [ActionType.BET, ActionType.RAISE],
  "all-in": [ActionType.ALL_IN],
};

export interface Card {
  rank: string; // A, K, Q, J, T, 9, 8, 7, 6, 5, 4, 3, 2
  suit: "spades" | "hearts" | "diamonds" | "clubs";
}

export interface HoleCards {
  card1: Card;
  card2: Card;
  handType: string; // e.g., "AKs", "QQ", "72o"
}

export interface PlayerAction {
  position: Position;
  action: UIActionType;
  amount?: number;
  timestamp: number;
}

export interface Player {
  position: Position;
  stack: number;
  isActive: boolean;
  isHero: boolean;
  action?: PlayerAction;
  cards?: HoleCards;
}

export interface GTOStrategy {
  fold: number;
  check: number;
  call: number;
  raise: number;
  allIn: number;
}

export interface Scenario {
  players: Player[];
  heroPosition: Position;
  heroCards: HoleCards;
  pot: number;
  currentBet: number;
  actions: PlayerAction[];
  legalActions: UIActionType[];
}

export interface TrainerResult {
  userAction: UIActionType;
  gtoStrategy: GTOStrategy;
  isCorrect: boolean;
  feedback: string;
}

export interface UserStats {
  totalHands: number;
  correctDecisions: number;
  accuracy: number;
  sessionStart: string;
}

// Range viewer types
export interface RangeData {
  [handType: string]: GTOStrategy;
}

export interface ActionDistribution {
  fold: number;
  check: number;
  call: number;
  raise: number;
  allIn: number;
}
