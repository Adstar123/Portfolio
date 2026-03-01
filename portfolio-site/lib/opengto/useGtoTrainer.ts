/**
 * GTO Trainer orchestration functions.
 *
 * These are plain async functions (not a React hook) that wire together
 * scenario generation, feature extraction, ONNX inference, and result
 * evaluation. They replace the Flask API calls from the original Electron app.
 */
import {
  ActionType,
  UIActionType,
  UI_TO_ACTION,
  Position,
  Scenario,
  TrainerResult,
  GTOStrategy,
  RangeData,
} from "./types";
import type { ActionHistoryEntry } from "./featureVector";
import { buildFeatureVector } from "./featureVector";
import { buildFeatureInput, buildRangeScenario } from "./scenarioGenerator";
import { getAllHandTypes } from "./card";
import { getGTOStrategy, getSession } from "./inference";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert 6-element raw probability array to a GTOStrategy object. */
function toGTOStrategy(probs: number[]): GTOStrategy {
  return {
    fold: probs[ActionType.FOLD],
    check: probs[ActionType.CHECK],
    call: probs[ActionType.CALL],
    raise: probs[ActionType.BET] + probs[ActionType.RAISE],
    allIn: probs[ActionType.ALL_IN],
  };
}

/**
 * Map an array of UIActionType legal actions to the corresponding ActionType[].
 * e.g. ["fold", "raise", "all-in"] -> [FOLD, BET, RAISE, ALL_IN]
 */
function uiActionsToActionTypes(uiActions: UIActionType[]): ActionType[] {
  const actionTypes = new Set<ActionType>();
  for (const uiAction of uiActions) {
    for (const at of UI_TO_ACTION[uiAction]) {
      actionTypes.add(at);
    }
  }
  return Array.from(actionTypes);
}

/**
 * Sum the raw probabilities for the ActionType(s) that correspond to a
 * given UIActionType.
 */
function uiActionProbability(probs: number[], uiAction: UIActionType): number {
  return UI_TO_ACTION[uiAction].reduce((sum, at) => sum + probs[at], 0);
}

/** Capitalise the first letter of a string. */
function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Format a UIActionType for display (e.g. "all-in" -> "going all-in"). */
function actionVerb(action: UIActionType): string {
  switch (action) {
    case "fold":
      return "folding";
    case "check":
      return "checking";
    case "call":
      return "calling";
    case "raise":
      return "raising";
    case "all-in":
      return "going all-in";
  }
}

// ─── evaluateAction ─────────────────────────────────────────────────────────

/**
 * Evaluate a user's action against the GTO strategy.
 *
 * 1. Build a feature vector from the scenario
 * 2. Run ONNX inference
 * 3. Convert raw probabilities to GTOStrategy
 * 4. Determine correctness using the same thresholds as the original app
 * 5. Generate human-readable feedback
 */
export async function evaluateAction(
  scenario: Scenario,
  userAction: UIActionType
): Promise<TrainerResult> {
  // Build the feature input and 317-dim feature vector
  const featureInput = buildFeatureInput(scenario);
  const features = buildFeatureVector(featureInput);

  // Determine legal ActionTypes from the scenario's legal UI actions
  const legalActionTypes = uiActionsToActionTypes(scenario.legalActions);

  // Run inference — returns 6 raw probabilities (one per ActionType)
  const rawProbs = await getGTOStrategy(features, legalActionTypes);

  // Convert to GTOStrategy (merging BET + RAISE into "raise")
  const gtoStrategy = toGTOStrategy(rawProbs);

  // Calculate the probability the GTO model assigns to the user's action
  const userActionProb = uiActionProbability(rawProbs, userAction);

  // Find the best legal UI action probability
  let bestActionProb = 0;
  let bestAction: UIActionType = scenario.legalActions[0];
  for (const uiAction of scenario.legalActions) {
    const prob = uiActionProbability(rawProbs, uiAction);
    if (prob > bestActionProb) {
      bestActionProb = prob;
      bestAction = uiAction;
    }
  }

  // Determine correctness using the original thresholds:
  // "Correct" if userActionProb > 0.25 OR userActionProb >= (bestActionProb - 0.10)
  const isCorrect =
    userActionProb > 0.25 || userActionProb >= bestActionProb - 0.1;

  // Generate feedback string
  const pctUser = Math.round(userActionProb * 100);
  const pctBest = Math.round(bestActionProb * 100);
  let feedback: string;

  if (isCorrect) {
    feedback = `Correct! GTO recommends ${actionVerb(userAction)} ${pctUser}% here.`;
  } else {
    feedback = `Incorrect. GTO prefers ${actionVerb(bestAction)} (${pctBest}%).`;
  }

  return {
    userAction,
    gtoStrategy,
    isCorrect,
    feedback,
  };
}

// ─── getRangeStrategy ───────────────────────────────────────────────────────

/**
 * Compute the GTO strategy for all 169 hand types given a position and
 * preceding action sequence. Used by the Range Viewer.
 *
 * This runs 169 inferences (one per hand type). Each inference is
 * sub-millisecond on WASM, so the whole batch should complete in <500ms.
 */
export async function getRangeStrategy(
  heroPosition: Position,
  actionsBefore: ActionHistoryEntry[]
): Promise<RangeData> {
  // Build the base feature input (everything except handType)
  const baseInput = buildRangeScenario(heroPosition, actionsBefore);

  // Determine legal actions for this scenario. Since all 169 hands share
  // the same game state (only the hand type differs), we compute legal
  // actions once from the base input. We need to figure out which
  // ActionTypes are legal. In the range viewer context, the legal actions
  // depend on the game state, not the specific hand.
  //
  // We derive legal ActionTypes from the pot/bet state:
  // - If there's a bet to face (currentBet > heroCurrentBet): fold, call, raise, all-in
  // - If no bet to face: check, raise (bet), all-in
  const callAmount = baseInput.currentBet - baseInput.heroCurrentBet;
  const legalUIActions: UIActionType[] = [];

  if (callAmount > 0) {
    legalUIActions.push("fold", "call", "raise", "all-in");
  } else {
    legalUIActions.push("check", "raise", "all-in");
  }

  const legalActionTypes = uiActionsToActionTypes(legalUIActions);

  // Ensure the model is loaded before the hot loop
  await getSession();

  const allHandTypes = getAllHandTypes();
  const rangeData: RangeData = {};

  // Run inference for each of the 169 hand types
  for (const handType of allHandTypes) {
    const featureInput = { ...baseInput, handType };
    const features = buildFeatureVector(featureInput);
    const rawProbs = await getGTOStrategy(features, legalActionTypes);
    rangeData[handType] = toGTOStrategy(rawProbs);
  }

  return rangeData;
}

// ─── preloadModel ───────────────────────────────────────────────────────────

/**
 * Pre-load the ONNX model so that the first inference call is fast.
 * Call this early (e.g. on page mount) to trigger the download.
 */
export async function preloadModel(): Promise<void> {
  await getSession();
}
