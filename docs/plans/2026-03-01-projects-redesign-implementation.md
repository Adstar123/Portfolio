# Projects Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:executing-plans to implement this plan task-by-task.

**Goal:** Port the OpenGTO poker trainer to run entirely in the browser via ONNX, create dedicated project pages, and update the projects section.

**Architecture:** Export the PyTorch AverageStrategyNetwork to ONNX, port the Python poker engine (card system, game state, 317-dim feature encoding, scenario builder) to TypeScript, wrap inference with onnxruntime-web, port the React UI components to Next.js, create dedicated routes at `/projects/opengto` and `/projects/ai-copilot`, and update the main page with modal-to-page navigation.

**Tech Stack:** Next.js 15, React 19, onnxruntime-web, TypeScript, Framer Motion, Tailwind CSS, Lucide React

**Design Doc:** `docs/plans/2026-03-01-projects-redesign-design.md`

**Source Reference:** OpenGTO source at `G:\OpenGTO\` — Python backend in `src/`, React frontend in `frontend/src/`

---

### Task 0: Install Dependencies & Export ONNX Model

**Files:**
- Modify: `portfolio-site/package.json`
- Create: `scripts/export_onnx.py` (one-time use)
- Create: `portfolio-site/public/models/opengto_model.onnx`

**Step 1: Install onnxruntime-web**

```bash
cd portfolio-site && npm install onnxruntime-web
```

**Step 2: Create the ONNX export script**

Create `scripts/export_onnx.py`:

```python
"""Export the AverageStrategyNetwork from the PyTorch checkpoint to ONNX."""
import torch
import sys
sys.path.insert(0, "G:/OpenGTO")
from src.neural_network import AverageStrategyNetwork

# Load checkpoint
checkpoint = torch.load("G:/OpenGTO/checkpoints_improved/gto_trainer_final.pt", map_location="cpu")

# Reconstruct network — the checkpoint was saved with hidden_sizes=(512, 512, 256, 128)
# Check state dict keys to determine architecture
state_dict = checkpoint["avg_strategy_net"]
# Determine hidden sizes from weight shapes
hidden_sizes = []
i = 0
while f"hidden.{i * 4}.weight" in state_dict:
    hidden_sizes.append(state_dict[f"hidden.{i * 4}.weight"].shape[0])
    i += 1
print(f"Detected hidden sizes: {hidden_sizes}")

net = AverageStrategyNetwork(
    input_size=317,
    hidden_sizes=tuple(hidden_sizes),
    num_actions=6,
    dropout=0.0  # No dropout for inference
)
net.load_state_dict(state_dict)
net.eval()

# Export to ONNX
dummy_input = torch.randn(1, 317)
torch.onnx.export(
    net,
    dummy_input,
    "portfolio-site/public/models/opengto_model.onnx",
    input_names=["features"],
    output_names=["logits"],
    dynamic_axes={"features": {0: "batch"}, "logits": {0: "batch"}},
    opset_version=17,
    do_constant_folding=True,
)
print("Exported to portfolio-site/public/models/opengto_model.onnx")
```

NOTE: The ONNX export should output raw logits (before softmax). We apply softmax + legal action masking in TypeScript. If the model's forward() already applies softmax, we may need to modify the export to output logits instead — check the output and adjust.

**Step 3: Run the export script**

```bash
cd /c/Users/Adam/Desktop/Portfolio && python scripts/export_onnx.py
```

Verify the file exists and check size (should be 2-5MB).

**Step 4: Verify ONNX model**

```bash
python -c "import onnxruntime as ort; sess = ort.InferenceSession('portfolio-site/public/models/opengto_model.onnx'); print('Input:', sess.get_inputs()[0].shape); print('Output:', sess.get_outputs()[0].shape)"
```

Expected: Input shape [1, 317], Output shape [1, 6]

**Step 5: Commit**

```bash
git add portfolio-site/package.json portfolio-site/package-lock.json portfolio-site/public/models/ scripts/
git commit -m "adding onnx model export and onnxruntime-web"
```

---

### Task 1: TypeScript Poker Engine — Types & Card System

**Files:**
- Create: `portfolio-site/lib/opengto/types.ts`
- Create: `portfolio-site/lib/opengto/card.ts`

**Source reference:** `G:\OpenGTO\src\card.py` and `G:\OpenGTO\frontend\src\types\index.ts`

**Step 1: Create the types file**

Create `portfolio-site/lib/opengto/types.ts` — this combines the Python enums with the existing frontend types:

```typescript
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
```

**Step 2: Create the card system**

Create `portfolio-site/lib/opengto/card.ts` — port from `G:\OpenGTO\src\card.py`:

```typescript
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
  const ranks = "AKQJT98765432";
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
```

**Step 3: Commit**

```bash
git add portfolio-site/lib/opengto/
git commit -m "adding typescript poker types and card system"
```

---

### Task 2: TypeScript Poker Engine — Game State & Feature Vector

**Files:**
- Create: `portfolio-site/lib/opengto/gameState.ts`
- Create: `portfolio-site/lib/opengto/featureVector.ts`

**Source reference:** `G:\OpenGTO\src\game_state.py` and `G:\OpenGTO\src\information_set.py`

**Step 1: Create game state**

Create `portfolio-site/lib/opengto/gameState.ts` — port game state management and feature vector encoding. This must produce the identical 317-dim feature vector as the Python code.

Key implementation details:
- Positions are integers 0-5 (UTG=0, HJ=1, CO=2, BTN=3, SB=4, BB=5)
- Feature vector layout: [169 hand one-hot] + [6 position one-hot] + [6 stacks/100] + [pot/100] + [callAmount/100] + [potOdds] + [spr/10 capped] + [numActive/numPlayers] + [numRaises/4 capped] + [10 actions × 13 features]
- Total: 317 dimensions
- All amounts normalised by 100 (big blinds)
- Action history: each action is 6 position one-hot + 6 action type one-hot + 1 amount/100 = 13 features

Port the `GameState.to_feature_vector()` method and `InformationSet.to_feature_vector()` exactly. The neural network was trained with specific feature encoding — any deviation will produce garbage output.

**Step 2: Create feature vector builder**

Create `portfolio-site/lib/opengto/featureVector.ts`:

This function takes a scenario description and produces the exact 317-dim Float32Array the ONNX model expects. Reference `G:\OpenGTO\src\game_state.py:253-328` for the canonical encoding.

```typescript
import { handTypeToIndex } from "./card";
import { ActionType, Position, POSITIONS } from "./types";

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
```

**Step 3: Commit**

```bash
git add portfolio-site/lib/opengto/
git commit -m "adding game state and feature vector encoding"
```

---

### Task 3: TypeScript Poker Engine — Scenario Generator

**Files:**
- Create: `portfolio-site/lib/opengto/scenarioGenerator.ts`

**Source reference:** `G:\OpenGTO\src\poker_engine.py` (ScenarioBuilder), `G:\OpenGTO\frontend\src\hooks\useTrainer.ts` (generateMockScenario)

**Step 1: Create scenario generator**

This generates random poker scenarios for the trainer, matching the logic in `api_server.py` GET /scenario:
- Pick random hero position (UTG through SB — not BB since BB always checks/folds to close action)
- Generate random hero cards
- Generate villain actions before hero (fold/raise with realistic frequencies)
- Calculate pot and legal actions
- Return a full `Scenario` object ready for the UI

Also create a function to build scenarios for the Range Viewer:
- Given a hero position, hand type, and action history, build the scenario
- Used to query GTO strategy for specific spots

Port the logic from `G:\OpenGTO\frontend\src\hooks\useTrainer.ts:39-125` (generateMockScenario) but also add the `buildFeatureInput()` function that converts a Scenario into the FeatureInput needed for the feature vector.

**Step 2: Commit**

```bash
git add portfolio-site/lib/opengto/
git commit -m "adding scenario generator"
```

---

### Task 4: ONNX Inference Engine

**Files:**
- Create: `portfolio-site/lib/opengto/inference.ts`
- Create: `portfolio-site/lib/opengto/index.ts` (barrel export)

**Step 1: Create the inference engine**

Create `portfolio-site/lib/opengto/inference.ts`:

```typescript
import * as ort from "onnxruntime-web";
import { ActionType } from "./types";

let session: ort.InferenceSession | null = null;
let loading: Promise<ort.InferenceSession> | null = null;

/**
 * Lazy-load the ONNX model. Returns cached session on subsequent calls.
 */
export async function getSession(): Promise<ort.InferenceSession> {
  if (session) return session;
  if (loading) return loading;

  loading = ort.InferenceSession.create("/models/opengto_model.onnx", {
    executionProviders: ["wasm"],
  });

  session = await loading;
  loading = null;
  return session;
}

/**
 * Run inference on a 317-dim feature vector.
 * Returns raw logits (6 values, one per action).
 */
async function runInference(features: Float32Array): Promise<Float32Array> {
  const sess = await getSession();
  const tensor = new ort.Tensor("float32", features, [1, 317]);
  const results = await sess.run({ features: tensor });
  const outputName = sess.outputNames[0];
  return results[outputName].data as Float32Array;
}

/**
 * Apply softmax to logits with illegal action masking.
 * legalMask: boolean array of length 6, true = legal.
 */
function maskedSoftmax(logits: Float32Array, legalMask: boolean[]): number[] {
  const masked = logits.map((v, i) => (legalMask[i] ? v : -Infinity));
  const maxVal = Math.max(...masked.filter((v) => v !== -Infinity));
  const exps = masked.map((v) => (v === -Infinity ? 0 : Math.exp(v - maxVal)));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => (sum > 0 ? v / sum : 0));
}

/**
 * Get GTO strategy for a game state.
 * Returns probability distribution over 6 actions.
 */
export async function getGTOStrategy(
  features: Float32Array,
  legalActions: ActionType[]
): Promise<number[]> {
  const logits = await runInference(features);
  const legalMask = Array.from({ length: 6 }, (_, i) =>
    legalActions.includes(i as ActionType)
  );
  return maskedSoftmax(logits, legalMask);
}

/** Check if the ONNX model has been loaded */
export function isModelLoaded(): boolean {
  return session !== null;
}
```

NOTE: The model may output softmax probabilities instead of logits (if the PyTorch forward() applies softmax). Test the output — if values are already 0-1 and sum to ~1, skip the softmax step and just apply masking + renormalization.

**Step 2: Create barrel export**

Create `portfolio-site/lib/opengto/index.ts`:

```typescript
export * from "./types";
export * from "./card";
export * from "./featureVector";
export * from "./scenarioGenerator";
export * from "./inference";
```

**Step 3: Commit**

```bash
git add portfolio-site/lib/opengto/
git commit -m "adding onnx inference engine"
```

---

### Task 5: GTO Trainer Hook

**Files:**
- Create: `portfolio-site/lib/opengto/useGtoTrainer.ts`

**Step 1: Create the trainer hook**

This replaces the Flask API calls (`useTrainer.ts`). It orchestrates scenario generation, feature vector building, ONNX inference, and result evaluation — all client-side.

Key logic:
- `generateScenario()`: Creates random scenario, returns Scenario object
- `evaluateAction(scenario, userAction)`: Builds feature vector from scenario, runs ONNX inference, compares user action to GTO strategy, returns TrainerResult
- `getRangeStrategy(position, actionHistory)`: For Range Viewer — runs inference for all 169 hand types and returns a RangeData map
- "Correct" threshold: action frequency >25% OR within 10% of best action (matching `G:\OpenGTO\api_server.py` logic)

**Step 2: Commit**

```bash
git add portfolio-site/lib/opengto/
git commit -m "adding gto trainer hook"
```

---

### Task 6: Port UI Components — Cards & Players

**Files:**
- Create: `portfolio-site/components/OpenGTO/PlayingCard.tsx`
- Create: `portfolio-site/components/OpenGTO/PlayerSeat.tsx`

**Source reference:** `G:\OpenGTO\frontend\src\components\PlayingCard.tsx` and `G:\OpenGTO\frontend\src\components\PlayerSeat.tsx`

**Step 1: Port PlayingCard**

Key changes from source:
- Add `"use client"` directive
- Replace `framer-motion` import with `motion/react`
- Replace inline CSS variables with Tailwind or portfolio theme variables
- Use Lucide icons instead of @mdi/react
- Card styling: red for hearts/diamonds, white for spades/clubs on dark card background
- Card dimensions: ~65x90px for hero, ~40x55px for mini cards

**Step 2: Port PlayerSeat**

Key changes:
- Add `"use client"` directive
- Replace motion imports
- Style to match portfolio dark theme (rgba(20,20,20,0.8) backgrounds like skill cards)
- Position labels and action badges with amber/orange accents

**Step 3: Commit**

```bash
git add portfolio-site/components/OpenGTO/
git commit -m "adding playing card and player seat components"
```

---

### Task 7: Port UI Components — Poker Table

**Files:**
- Create: `portfolio-site/components/OpenGTO/PokerTable.tsx`

**Source reference:** `G:\OpenGTO\frontend\src\components\PokerTable.tsx`

**Step 1: Port PokerTable**

The poker table is the centrepiece visual. Key elements:
- Oval green felt table (550×340px) with wood-grain border
- 6 player seats arranged around the table, hero always at bottom
- Position rotation so hero is always at seat 0
- Pot display in centre with golden accent
- Hero cards shown with hand type badge
- Animated sequential villain action reveals (350ms stagger)
- Ambient green glow background

Key changes from source:
- `"use client"` directive
- `motion/react` imports
- Use CSS modules or Tailwind instead of inline `<style>` tags
- Keep the green felt aesthetic (provides nice contrast against portfolio's dark theme)
- Maintain all animation logic (card reveals, action sequence)

**Step 2: Commit**

```bash
git add portfolio-site/components/OpenGTO/
git commit -m "adding poker table component"
```

---

### Task 8: Port UI Components — Action Panel & Result Modal

**Files:**
- Create: `portfolio-site/components/OpenGTO/ActionPanel.tsx`
- Create: `portfolio-site/components/OpenGTO/ResultModal.tsx`
- Create: `portfolio-site/components/OpenGTO/StatsPanel.tsx`

**Source reference:** `G:\OpenGTO\frontend\src\components\ActionPanel.tsx`, `ResultModal.tsx`, `StatsPanel.tsx`

**Step 1: Port ActionPanel**

- 5 action buttons: Fold, Check, Call, Raise, All-In
- Grid layout (5 columns)
- Disabled/greyed out for illegal actions
- Keyboard shortcuts (F/X/C/R/A) — add useEffect for keydown listener
- Replace @mdi icons with Lucide equivalents:
  - Fold → `hand` or `x-circle`
  - Check → `check`
  - Call → `hand-coins` or `coins`
  - Raise → `trending-up`
  - All-In → `zap`
- Action colours: fold=#ff453a, check=#32d74b, call=#0a84ff, raise=#ff9f0a, allIn=#ff375f

**Step 2: Port ResultModal**

- Overlay with backdrop blur
- Correct/Incorrect header with animated icon
- GTO strategy bars (animated fill)
- Your Action vs GTO Recommends comparison
- Next Hand button with amber/gold gradient

**Step 3: Port StatsPanel**

- Shows total hands, correct decisions, accuracy percentage
- Compact panel in top-right area
- Session tracking (resets on page load)

**Step 4: Commit**

```bash
git add portfolio-site/components/OpenGTO/
git commit -m "adding action panel, result modal, and stats panel"
```

---

### Task 9: Port UI Components — Range Viewer

**Files:**
- Create: `portfolio-site/components/OpenGTO/RangeMatrix.tsx`
- Create: `portfolio-site/components/OpenGTO/RangeViewer.tsx`

**Source reference:** `G:\OpenGTO\frontend\src\components\RangeMatrix.tsx` and `G:\OpenGTO\frontend\src\components\RangeViewer.tsx`

**Step 1: Port RangeMatrix**

- 13×13 grid showing all 169 hand types
- Rows/cols labelled A through 2
- Cell colours based on strategy:
  - Background gradient mixing fold (red), call (blue), raise (orange), all-in (pink) proportionally
  - Diagonal cells (pairs) get a border indicator
  - Upper triangle = suited, lower triangle = offsuit
- Click cell to inspect detailed strategy
- Hover shows hand type name

**Step 2: Port RangeViewer**

- Hero position selector (6 buttons, horizontal)
- Opponent action configurator: for each position before hero, select fold/raise/call
- RangeMatrix (left/centre)
- Detail panel (right): selected hand strategy, action distribution, mini table diagram
- Queries ONNX model for all 169 hands (batch or sequential) when configuration changes
- Loading state while computing (169 inferences, should complete in <500ms total)

**Step 3: Commit**

```bash
git add portfolio-site/components/OpenGTO/
git commit -m "adding range matrix and range viewer"
```

---

### Task 10: Create Projects Layout & Routing

**Files:**
- Create: `portfolio-site/app/projects/layout.tsx`

**Step 1: Create shared projects layout**

```typescript
// portfolio-site/app/projects/layout.tsx
"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Back navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ background: "rgba(10, 10, 10, 0.8)", backdropFilter: "blur(12px)" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </Link>
      </motion.nav>

      <main className="pt-16">{children}</main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add portfolio-site/app/projects/
git commit -m "adding projects layout with back navigation"
```

---

### Task 11: Create OpenGTO Page

**Files:**
- Create: `portfolio-site/app/projects/opengto/page.tsx`

**Step 1: Build the OpenGTO page**

This page assembles all the ported components:

Structure:
1. **Hero section**: Title "OpenGTO", tagline, description, tech badges, GitHub link
2. **Model loading indicator**: Shows on first visit while ONNX model downloads
3. **Tab bar**: Trainer | Range Viewer (using the same tab pattern as the original App.tsx)
4. **Trainer tab**: PokerTable + ActionPanel + StatsPanel + ResultModal
5. **Range Viewer tab**: RangeViewer component

State management mirrors `G:\OpenGTO\frontend\src\App.tsx`:
- `scenario`, `result`, `isAnimating`, `showResult`, `stats`, `activeTab`
- `startNewHand()` generates scenario via useGtoTrainer
- `handleAction()` evaluates via ONNX inference
- `handleNextHand()` cycles to new scenario

Key addition: model loading state with progress indicator before any inference can happen.

**Step 2: Commit**

```bash
git add portfolio-site/app/projects/opengto/
git commit -m "adding opengto interactive page"
```

---

### Task 12: Create AI Copilot Page

**Files:**
- Create: `portfolio-site/app/projects/ai-copilot/page.tsx`

**Step 1: Build the AI Copilot showcase page**

Structure:
1. **Hero section**: Title, tagline, description, tech badges, GitHub link
2. **Screenshot showcase**: 3 screenshots in Chrome extension mockup frames
   - `CopilotLogin.png` — "Login"
   - `CopilotLoading.png` — "Analysing Learning Data"
   - `CopilotRecommendations.png` — "Personalised Recommendations"
3. **Key Results section**: Quote/stats block about research outcomes

Screenshot mockup styling:
- Chrome popup frame: rounded corners, dark header bar with dots, URL bar
- Drop shadow, subtle 2-3° tilt
- Hover: scale up 1.05, remove tilt
- Click: lightbox view (fullscreen overlay with the screenshot)
- Staggered entrance animations

**Step 2: Commit**

```bash
git add portfolio-site/app/projects/ai-copilot/
git commit -m "adding ai copilot showcase page"
```

---

### Task 13: Update Main Page Projects Section

**Files:**
- Modify: `portfolio-site/components/Projects/ProjectModal.tsx`
- Modify: `portfolio-site/lib/data.ts` (add `route` field to Project interface)

**Step 1: Add route field to Project data**

Add `route?: string` to the Project interface and set:
- OpenGTO: `route: "/projects/opengto"`
- AI Copilot: `route: "/projects/ai-copilot"`

**Step 2: Update ProjectModal**

Add an "Explore Full Project →" button at the bottom of the modal:
- Uses `next/link` to navigate to the project's route
- For OpenGTO: "Try the Trainer →" with a special call-to-action style
- For AI Copilot: "View Project →"
- Button style: amber gradient, prominent placement below the GitHub link

**Step 3: Commit**

```bash
git add portfolio-site/components/Projects/ portfolio-site/lib/data.ts
git commit -m "adding explore project links to modal"
```

---

### Task 14: Build Verification & Polish

**Step 1: Run build**

```bash
cd portfolio-site && npm run build
```

Fix any TypeScript errors or build issues.

**Step 2: Test in browser**

- Navigate to `/projects/opengto` — verify model loads, trainer works, range viewer works
- Navigate to `/projects/ai-copilot` — verify screenshots display
- Test main page → modal → "Explore Full Project" flow
- Test back navigation from project pages

**Step 3: Commit final fixes**

```bash
git add -A && git commit -m "build fixes and polish"
```
