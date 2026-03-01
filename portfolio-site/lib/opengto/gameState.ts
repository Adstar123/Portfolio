/**
 * Lightweight game state management for the poker trainer.
 *
 * This is NOT a full poker engine — it tracks just enough state to:
 * 1. Set up a preflop scenario with villain actions already applied
 * 2. Determine what actions are legal for hero
 * 3. Track pot/stacks/bets accurately for the feature vector
 *
 * Ported from Python: game_state.py + poker_engine.py
 */
import {
  ActionType,
  Position,
  PREFLOP_ORDER,
  UIActionType,
} from "./types";
import type { FeatureInput, ActionHistoryEntry } from "./featureVector";

// ─── Internal Types ────────────────────────────────────────────────────────────

interface PlayerState {
  position: Position;
  stack: number; // in BB
  currentBet: number; // amount committed this betting round
  isActive: boolean; // still in the hand (hasn't folded)
  hasActed: boolean; // has taken an action this round
  isAllIn: boolean;
}

interface GameAction {
  actionType: ActionType;
  amount: number; // in BB (total bet/raise-to amount, or 0 for fold/check)
  position: Position;
}

// ─── GameState Class ───────────────────────────────────────────────────────────

export class GameState {
  players: PlayerState[];
  pot: number;
  currentBet: number; // highest bet on the table
  minRaise: number; // minimum legal raise increment
  actionHistory: GameAction[];
  currentPlayerIdx: number;
  isComplete: boolean;

  constructor(stacks?: number[]) {
    // Initialise 6 players at default 100bb
    this.players = PREFLOP_ORDER.map((pos, i) => ({
      position: pos,
      stack: stacks?.[i] ?? 100.0,
      currentBet: 0,
      isActive: true,
      hasActed: false,
      isAllIn: false,
    }));
    this.pot = 0;
    this.currentBet = 0;
    this.minRaise = 1.0; // 1 BB
    this.actionHistory = [];
    this.currentPlayerIdx = 0; // UTG acts first preflop (set after blinds)
    this.isComplete = false;
  }

  // ── Blinds ───────────────────────────────────────────────────────────────

  /** Post small blind (0.5bb) and big blind (1.0bb). Sets UTG to act first. */
  postBlinds(): void {
    const sb = this.getPlayerByPosition("SB");
    const bb = this.getPlayerByPosition("BB");

    if (sb) {
      const blindAmount = Math.min(0.5, sb.stack);
      sb.currentBet = blindAmount;
      sb.stack -= blindAmount;
      this.pot += blindAmount;
    }

    if (bb) {
      const blindAmount = Math.min(1.0, bb.stack);
      bb.currentBet = blindAmount;
      bb.stack -= blindAmount;
      this.pot += blindAmount;
      this.currentBet = blindAmount;
      this.minRaise = blindAmount; // min raise is 1 BB
    }

    // First to act preflop is UTG (index 0)
    this.currentPlayerIdx = 0;
  }

  // ── Player Accessors ─────────────────────────────────────────────────────

  get currentPlayer(): PlayerState {
    return this.players[this.currentPlayerIdx];
  }

  get activePlayers(): PlayerState[] {
    return this.players.filter((p) => p.isActive);
  }

  get numActivePlayers(): number {
    return this.players.filter((p) => p.isActive).length;
  }

  getPlayerByPosition(position: Position): PlayerState | undefined {
    return this.players.find((p) => p.position === position);
  }

  // ── Legal Actions ────────────────────────────────────────────────────────

  /**
   * Returns the set of legal UI actions for the current player.
   * Maps from the full ActionType system to simplified UIActionType.
   */
  getLegalActions(): UIActionType[] {
    const player = this.currentPlayer;
    if (!player.isActive || player.isAllIn) return [];

    const callAmount = this.currentBet - player.currentBet;
    const effectiveStack = player.stack; // stack already has blinds deducted

    const actions: UIActionType[] = [];

    // Fold: only if there's a bet to face
    if (callAmount > 0) {
      actions.push("fold");
    }

    // Check: only if no bet to call
    if (callAmount === 0) {
      actions.push("check");
    }

    // Call: if there's a bet and we have chips
    if (callAmount > 0 && effectiveStack > 0) {
      if (effectiveStack <= callAmount) {
        // Can only all-in (not enough to call outright)
        actions.push("all-in");
      } else {
        actions.push("call");
      }
    }

    // Raise (covers both BET and RAISE): if we have more than the call amount
    if (effectiveStack > callAmount) {
      const minRaiseTo = this.currentBet + this.minRaise;
      // Can raise if we have enough for at least the minimum raise
      if (player.stack + player.currentBet >= minRaiseTo) {
        actions.push("raise");
      }
      // All-in is always available if we have more than a call
      if (!actions.includes("all-in")) {
        actions.push("all-in");
      }
    }

    return actions;
  }

  // ── Apply Action ─────────────────────────────────────────────────────────

  /**
   * Apply an action and return a NEW GameState (immutable pattern).
   * The action uses UIActionType + optional amount (for raises).
   */
  applyAction(
    uiAction: UIActionType,
    amount?: number // raise-to amount in BB (required for "raise")
  ): GameState {
    const next = this.clone();
    const player = next.currentPlayer;

    // Map UI action to internal ActionType
    let actionType: ActionType;
    let actionAmount = 0;

    switch (uiAction) {
      case "fold":
        actionType = ActionType.FOLD;
        next.handleFold(player);
        break;

      case "check":
        actionType = ActionType.CHECK;
        // Nothing to update
        break;

      case "call":
        actionType = ActionType.CALL;
        actionAmount = next.currentBet;
        next.handleCall(player);
        break;

      case "raise": {
        // Determine if this is an open bet or a raise
        const raiseTo = amount ?? next.defaultRaiseAmount();
        if (next.currentBet === 0) {
          actionType = ActionType.BET;
        } else {
          actionType = ActionType.RAISE;
        }
        actionAmount = raiseTo;
        next.handleRaise(player, raiseTo);
        break;
      }

      case "all-in":
        actionType = ActionType.ALL_IN;
        actionAmount = player.stack + player.currentBet; // total committed
        next.handleAllIn(player);
        break;
    }

    // Record action
    player.hasActed = true;
    next.actionHistory.push({
      actionType,
      amount: actionAmount,
      position: player.position,
    });

    // Check completion or advance to next player
    if (next.checkHandComplete()) {
      next.isComplete = true;
    } else {
      const nextIdx = next.getNextPlayerIdx();
      if (nextIdx !== null) {
        next.currentPlayerIdx = nextIdx;
      } else {
        next.isComplete = true;
      }
    }

    return next;
  }

  // ── Action Handlers (mutate `this`) ──────────────────────────────────────

  private handleFold(player: PlayerState): void {
    player.isActive = false;
  }

  private handleCall(player: PlayerState): void {
    const callAmount = this.currentBet - player.currentBet;
    const actual = Math.min(callAmount, player.stack);
    player.stack -= actual;
    this.pot += actual;
    player.currentBet += actual;
    if (player.stack === 0) player.isAllIn = true;
  }

  private handleRaise(player: PlayerState, raiseTo: number): void {
    const raiseAmount = raiseTo - player.currentBet;
    const actual = Math.min(raiseAmount, player.stack);
    player.stack -= actual;
    this.pot += actual;
    const oldBet = this.currentBet;
    player.currentBet += actual;
    this.currentBet = player.currentBet;
    this.minRaise = this.currentBet - oldBet;
    if (player.stack === 0) player.isAllIn = true;

    // Reset hasActed for other active players (they must respond)
    for (const p of this.players) {
      if (p !== player && p.isActive && !p.isAllIn) {
        p.hasActed = false;
      }
    }
  }

  private handleAllIn(player: PlayerState): void {
    const allInAmount = player.stack;
    player.currentBet += allInAmount;
    this.pot += allInAmount;
    player.stack = 0;
    player.isAllIn = true;

    if (player.currentBet > this.currentBet) {
      const oldBet = this.currentBet;
      this.currentBet = player.currentBet;
      this.minRaise = Math.max(this.minRaise, this.currentBet - oldBet);

      // Reset hasActed for other active players
      for (const p of this.players) {
        if (p !== player && p.isActive && !p.isAllIn) {
          p.hasActed = false;
        }
      }
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  private getNextPlayerIdx(): number | null {
    const currentPos = this.currentPlayer.position;
    const currentOrderIdx = PREFLOP_ORDER.indexOf(currentPos);

    for (let i = 1; i <= PREFLOP_ORDER.length; i++) {
      const nextOrderIdx = (currentOrderIdx + i) % PREFLOP_ORDER.length;
      const nextPos = PREFLOP_ORDER[nextOrderIdx];

      for (let j = 0; j < this.players.length; j++) {
        const player = this.players[j];
        if (
          player.position === nextPos &&
          player.isActive &&
          !player.isAllIn &&
          (!player.hasActed || player.currentBet < this.currentBet)
        ) {
          return j;
        }
      }
    }

    return null;
  }

  // ── Completion Check ─────────────────────────────────────────────────────

  private checkHandComplete(): boolean {
    const active = this.activePlayers;

    // Only one player left
    if (active.length <= 1) return true;

    // All active (non all-in) players have acted and bets are matched
    const allActed = active
      .filter((p) => !p.isAllIn)
      .every((p) => p.hasActed);
    const betsMatched = active.every(
      (p) => p.currentBet === this.currentBet || p.isAllIn
    );
    if (allActed && betsMatched) return true;

    // Everyone is all-in
    if (active.every((p) => p.isAllIn)) return true;

    return false;
  }

  /** Public accessor for hand completion status. */
  isHandComplete(): boolean {
    return this.isComplete;
  }

  // ── Default Raise Sizing ─────────────────────────────────────────────────

  /** Default raise-to when no amount is specified. */
  private defaultRaiseAmount(): number {
    if (this.currentBet === 0) {
      // Open bet: 2.5x BB
      return 2.5;
    }
    // Raise: 3x the current bet
    return this.currentBet * 3;
  }

  // ── Feature Vector Conversion ────────────────────────────────────────────

  /**
   * Convert to FeatureInput for the feature vector builder.
   * The hero is the current player.
   */
  toFeatureInput(handType: string): FeatureInput {
    const hero = this.currentPlayer;

    const stacks: number[] = this.players.map((p) => p.stack);

    const actionHistoryEntries: ActionHistoryEntry[] = this.actionHistory.map(
      (a) => ({
        position: a.position,
        actionType: a.actionType,
        amount: a.amount,
      })
    );

    return {
      handType,
      heroPosition: hero.position,
      stacks,
      pot: this.pot,
      currentBet: this.currentBet,
      heroCurrentBet: hero.currentBet,
      actionHistory: actionHistoryEntries,
      numActivePlayers: this.numActivePlayers,
    };
  }

  // ── Clone ────────────────────────────────────────────────────────────────

  private clone(): GameState {
    const copy = new GameState();
    copy.players = this.players.map((p) => ({ ...p }));
    copy.pot = this.pot;
    copy.currentBet = this.currentBet;
    copy.minRaise = this.minRaise;
    copy.actionHistory = [...this.actionHistory];
    copy.currentPlayerIdx = this.currentPlayerIdx;
    copy.isComplete = this.isComplete;
    return copy;
  }
}
