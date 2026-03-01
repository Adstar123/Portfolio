/**
 * Scenario generation for the poker trainer and range viewer.
 *
 * Bridges the UI layer and the GameState engine:
 * - generateRandomScenario(): creates random preflop scenarios for training
 * - buildFeatureInput(): converts a Scenario into a FeatureInput for inference
 * - buildRangeScenario(): builds a partial FeatureInput for the range viewer
 */
import {
  ActionType,
  Position,
  PREFLOP_ORDER,
  UIActionType,
  Player,
  PlayerAction,
  Scenario,
} from "./types";
import { randomHoleCards } from "./card";
import { GameState } from "./gameState";
import type { FeatureInput, ActionHistoryEntry } from "./featureVector";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Hero-eligible positions (BB excluded — they act last preflop) */
const HERO_POSITIONS: Position[] = ["UTG", "HJ", "CO", "BTN", "SB"];

/** Pick a random element from an array */
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Weighted random selection.
 * Takes an array of [value, weight] tuples and returns a value
 * chosen proportionally to its weight.
 */
function weightedRandom<T>(options: [T, number][]): T {
  const totalWeight = options.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * totalWeight;
  for (const [value, weight] of options) {
    r -= weight;
    if (r <= 0) return value;
  }
  // Fallback (should not reach here)
  return options[options.length - 1][0];
}

// ─── generateRandomScenario ─────────────────────────────────────────────────

/**
 * Generate a random preflop poker scenario for the trainer.
 *
 * Picks a random hero position, deals random hole cards, then simulates
 * villain actions before the hero's turn using realistic probability
 * distributions. Uses GameState to track pot/stacks/bets accurately.
 */
export function generateRandomScenario(): Scenario {
  const heroPosition = pickRandom(HERO_POSITIONS);
  const heroCards = randomHoleCards();

  // Create a fresh game state and post blinds
  let state = new GameState();
  state.postBlinds();

  // Walk preflop order up to (but not including) the hero
  const heroOrderIdx = PREFLOP_ORDER.indexOf(heroPosition);
  let someoneRaised = false;

  for (let i = 0; i < heroOrderIdx; i++) {
    const pos = PREFLOP_ORDER[i];

    // Ensure the current player in the GameState matches the position
    // we expect. If someone folded ahead of us the GameState auto-advances,
    // so the current player should already be `pos` (or later, if that
    // player folded). We rely on GameState's internal pointer.
    if (state.currentPlayer.position !== pos) {
      // This position was already resolved (shouldn't happen in preflop
      // order, but guard against it).
      continue;
    }

    let action: UIActionType;
    let amount: number | undefined;

    if (!someoneRaised) {
      // No raise yet — first in or limpers
      action = weightedRandom<UIActionType>([
        ["fold", 60],
        ["call", 25],
        ["raise", 15],
      ]);
    } else {
      // Facing a raise
      action = weightedRandom<UIActionType>([
        ["fold", 70],
        ["call", 20],
        ["raise", 10],
      ]);
    }

    // Determine raise amount
    if (action === "raise") {
      someoneRaised = true;
      if (state.currentBet === 0 || state.currentBet <= 1) {
        // Open raise: 2.5 BB standard
        amount = 2.5;
      } else {
        // 3-bet / 4-bet: ~3× the current bet
        amount = state.currentBet * 3;
      }
    }

    state = state.applyAction(action, amount);
  }

  // Now the hero is the current player — extract the scenario info
  const pot = state.pot;
  const currentBet = state.currentBet;
  const legalActions = state.getLegalActions();

  // Build the action history as PlayerAction[]
  const actions: PlayerAction[] = state.actionHistory.map((a, i) => {
    let uiAction: UIActionType;
    switch (a.actionType) {
      case ActionType.FOLD:
        uiAction = "fold";
        break;
      case ActionType.CHECK:
        uiAction = "check";
        break;
      case ActionType.CALL:
        uiAction = "call";
        break;
      case ActionType.BET:
      case ActionType.RAISE:
        uiAction = "raise";
        break;
      case ActionType.ALL_IN:
        uiAction = "all-in";
        break;
    }

    return {
      position: a.position,
      action: uiAction,
      amount: a.amount > 0 ? a.amount : undefined,
      timestamp: Date.now() + i * 100,
    };
  });

  // Build the Player[] array
  const players: Player[] = state.players.map((p) => ({
    position: p.position,
    stack: p.stack,
    isActive: p.isActive,
    isHero: p.position === heroPosition,
    cards: p.position === heroPosition ? heroCards : undefined,
    action: actions.find((a) => a.position === p.position),
  }));

  return {
    players,
    heroPosition,
    heroCards,
    pot,
    currentBet,
    actions,
    legalActions,
  };
}

// ─── buildFeatureInput ──────────────────────────────────────────────────────

/**
 * Convert a Scenario object into a FeatureInput suitable for the
 * feature vector builder / model inference.
 */
export function buildFeatureInput(scenario: Scenario): FeatureInput {
  const heroPlayer = scenario.players.find((p) => p.isHero);
  if (!heroPlayer) {
    throw new Error("No hero player found in scenario");
  }

  // Build stacks array in position order (UTG..BB)
  const stacks: number[] = PREFLOP_ORDER.map((pos) => {
    const player = scenario.players.find((p) => p.position === pos);
    return player?.stack ?? 100;
  });

  // Convert PlayerAction[] → ActionHistoryEntry[]
  const actionHistory: ActionHistoryEntry[] = scenario.actions.map((a) => {
    let actionType: ActionType;
    switch (a.action) {
      case "fold":
        actionType = ActionType.FOLD;
        break;
      case "check":
        actionType = ActionType.CHECK;
        break;
      case "call":
        actionType = ActionType.CALL;
        break;
      case "raise":
        // Determine BET vs RAISE based on whether there was a prior bet.
        // Walk previous actions to see if anyone bet/raised before this.
        {
          const priorActions = scenario.actions.slice(
            0,
            scenario.actions.indexOf(a)
          );
          const hasPriorBet = priorActions.some(
            (pa) => pa.action === "raise" || pa.action === "all-in"
          );
          actionType = hasPriorBet ? ActionType.RAISE : ActionType.BET;
        }
        break;
      case "all-in":
        actionType = ActionType.ALL_IN;
        break;
    }

    return {
      position: a.position,
      actionType,
      amount: a.amount ?? 0,
    };
  });

  // Hero's current bet: the amount the hero has already committed
  // (blinds count — SB = 0.5, BB = 1.0, others = 0)
  let heroCurrentBet = 0;
  if (scenario.heroPosition === "SB") heroCurrentBet = 0.5;
  else if (scenario.heroPosition === "BB") heroCurrentBet = 1.0;

  // Count active players
  const numActivePlayers = scenario.players.filter((p) => p.isActive).length;

  return {
    handType: scenario.heroCards.handType,
    heroPosition: scenario.heroPosition,
    stacks,
    pot: scenario.pot,
    currentBet: scenario.currentBet,
    heroCurrentBet,
    actionHistory,
    numActivePlayers,
  };
}

// ─── buildRangeScenario ─────────────────────────────────────────────────────

/**
 * Build a partial FeatureInput (everything except hand type) for the range
 * viewer. The range viewer will fill in handType for each of the 169 possible
 * hands and run inference on each.
 *
 * @param heroPosition - The position to view the range from
 * @param actionsBefore - The action sequence that precedes the hero's decision
 * @returns Partial FeatureInput (omitting handType)
 */
export function buildRangeScenario(
  heroPosition: Position,
  actionsBefore: ActionHistoryEntry[]
): Omit<FeatureInput, "handType"> {
  // Replay actions through a fresh GameState to get accurate pot/stacks
  let state = new GameState();
  state.postBlinds();

  for (const entry of actionsBefore) {
    // Map ActionType back to UIActionType for applyAction
    let uiAction: UIActionType;
    let amount: number | undefined;

    switch (entry.actionType) {
      case ActionType.FOLD:
        uiAction = "fold";
        break;
      case ActionType.CHECK:
        uiAction = "check";
        break;
      case ActionType.CALL:
        uiAction = "call";
        break;
      case ActionType.BET:
      case ActionType.RAISE:
        uiAction = "raise";
        amount = entry.amount;
        break;
      case ActionType.ALL_IN:
        uiAction = "all-in";
        break;
    }

    state = state.applyAction(uiAction, amount);
  }

  // Now extract the feature input from the replayed state
  // The current player should be the hero position
  const hero = state.getPlayerByPosition(heroPosition);
  const heroCurrentBet = hero?.currentBet ?? 0;

  const stacks = state.players.map((p) => p.stack);

  return {
    heroPosition,
    stacks,
    pot: state.pot,
    currentBet: state.currentBet,
    heroCurrentBet,
    actionHistory: actionsBefore,
    numActivePlayers: state.numActivePlayers,
  };
}
