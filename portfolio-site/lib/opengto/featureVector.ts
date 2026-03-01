import { handTypeToIndex } from "./card";
import { ActionType, Position } from "./types";

const POSITION_INDEX: Record<Position, number> = {
  UTG: 0, HJ: 1, CO: 2, BTN: 3, SB: 4, BB: 5,
};

interface ActionHistoryEntry {
  position: Position;
  actionType: ActionType;
  amount: number; // in BB
}

interface FeatureInput {
  handType: string;
  heroPosition: Position;
  stacks: number[]; // 6 stacks in BB
  pot: number; // in BB
  currentBet: number; // in BB
  heroCurrentBet: number; // how much hero has already put in
  actionHistory: ActionHistoryEntry[];
  numActivePlayers: number;
}

/**
 * Build the 317-dim feature vector matching the Python training code.
 * This MUST produce identical output to GameState.to_feature_vector()
 *
 * Feature layout:
 * [0:169]   Hand type one-hot encoding
 * [169:175] Position one-hot encoding (6 positions)
 * [175:181] Stack sizes (normalised by 100bb)
 * [181]     Pot size (normalised by 100bb)
 * [182]     Current bet to call (normalised by 100bb)
 * [183]     Pot odds
 * [184]     Stack-to-pot ratio (capped at 10)
 * [185]     Number of active players (normalised)
 * [186]     Number of raises so far (normalised)
 * [187:317] Action history encoding (10 actions × 13 features each)
 */
export function buildFeatureVector(input: FeatureInput): Float32Array {
  const features = new Float32Array(317);
  let idx = 0;

  // 1. Hand type one-hot (169 dims)
  const handIdx = handTypeToIndex(input.handType);
  features[handIdx] = 1.0;
  idx = 169;

  // 2. Position one-hot (6 dims)
  features[idx + POSITION_INDEX[input.heroPosition]] = 1.0;
  idx += 6;

  // 3. Stack sizes normalised by 100bb (6 dims)
  for (let i = 0; i < 6; i++) {
    features[idx + i] = (input.stacks[i] ?? 0) / 100.0;
  }
  idx += 6;

  // 4. Pot size normalised
  features[idx++] = input.pot / 100.0;

  // 5. Call amount normalised
  const callAmount = Math.max(0, input.currentBet - input.heroCurrentBet);
  features[idx++] = callAmount / 100.0;

  // 6. Pot odds
  if (callAmount > 0 && input.pot > 0) {
    features[idx++] = callAmount / (input.pot + callAmount);
  } else {
    features[idx++] = 0;
  }

  // 7. Stack-to-pot ratio (capped at 10, normalised)
  const heroStack = input.stacks[POSITION_INDEX[input.heroPosition]] ?? 100;
  const effectiveStack = heroStack - input.heroCurrentBet;
  if (input.pot > 0) {
    features[idx++] = Math.min(effectiveStack / input.pot, 10.0) / 10.0;
  } else {
    features[idx++] = 1.0;
  }

  // 8. Number of active players normalised
  features[idx++] = input.numActivePlayers / 6;

  // 9. Number of raises/bets normalised by 4
  const numRaises = input.actionHistory.filter(
    (a) => a.actionType === ActionType.RAISE || a.actionType === ActionType.BET
  ).length;
  features[idx++] = Math.min(numRaises / 4.0, 1.0);

  // 10. Action history encoding (last 10 actions × 13 features = 130 dims)
  const recentActions = input.actionHistory.slice(-10);
  for (let i = 0; i < recentActions.length; i++) {
    const baseIdx = idx + i * 13;
    const action = recentActions[i];
    // Position one-hot (6)
    features[baseIdx + POSITION_INDEX[action.position]] = 1.0;
    // Action type one-hot (6)
    features[baseIdx + 6 + action.actionType] = 1.0;
    // Amount normalised
    features[baseIdx + 12] = action.amount / 100.0;
  }

  return features;
}

export type { FeatureInput, ActionHistoryEntry };
