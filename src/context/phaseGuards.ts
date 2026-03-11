import type { GameAction as AnyGameAction, GameState } from "@/context/GameContext";
import { getUnifiedPhase, isInFranchiseActionWindow } from "@/engine/phaseUtils";
import { resolveTradeDeadlineWeek } from "@/engine/tradeDeadline";

export type ValidPhaseActions =
  | "FA_SUBMIT_OFFER"
  | "FA_WITHDRAW_OFFER"
  | "FA_BOOTSTRAP_FROM_TAMPERING"
  | "TRADE_ACCEPT"
  | "TRADE_REJECT"
  | "TRADE_SUBMIT_OFFER"
  | "DRAFT_PICK"
  | "DRAFT_USER_PICK"
  | "DRAFT_SEND_TRADE_UP_OFFER"
  | "CUT_APPLY"
  | "SIGN_CONTRACT"
  | "CONTRACT_RESTRUCTURE_APPLY"
  | "EXTEND_PLAYER"
  | "EXTENSION_SUBMIT_OFFER"
  | "APPLY_FRANCHISE_TAG"
  | "TAG_APPLY";

const FREE_AGENCY_ONLY = new Set<ValidPhaseActions>([
  "FA_SUBMIT_OFFER",
  "FA_WITHDRAW_OFFER",
  "FA_BOOTSTRAP_FROM_TAMPERING",
]);

const DRAFT_ONLY = new Set<ValidPhaseActions>(["DRAFT_PICK", "DRAFT_USER_PICK", "DRAFT_SEND_TRADE_UP_OFFER"]);

const TRADE_ACTIONS = new Set<ValidPhaseActions>(["TRADE_ACCEPT", "TRADE_REJECT", "TRADE_SUBMIT_OFFER"]);

const CONTRACT_ACTIONS = new Set<ValidPhaseActions>(["CUT_APPLY", "CONTRACT_RESTRUCTURE_APPLY", "EXTEND_PLAYER", "EXTENSION_SUBMIT_OFFER", "APPLY_FRANCHISE_TAG", "TAG_APPLY", "SIGN_CONTRACT"]);

function getCurrentWeek(state: GameState): number {
  return Number(state.league?.week ?? state.hub?.regularSeasonWeek ?? state.week ?? 1);
}

function getTradeDeadlineWeek(state: GameState): number {
  return resolveTradeDeadlineWeek(state.league?.tradeDeadlineWeek);
}

export function isActionAllowedInCurrentPhase(state: GameState, action: AnyGameAction): { allowed: boolean; reason?: string } {
  const type = action.type as ValidPhaseActions;

  const phase = getUnifiedPhase(state);

  if (FREE_AGENCY_ONLY.has(type)) {
    if (!isInFranchiseActionWindow(phase, "free-agency")) {
      return { allowed: false, reason: `${action.type} requires FREE_AGENCY career stage.` };
    }
    return { allowed: true };
  }

  if (DRAFT_ONLY.has(type)) {
    if (!isInFranchiseActionWindow(phase, "draft")) {
      return { allowed: false, reason: `${action.type} requires DRAFT career stage.` };
    }
    return { allowed: true };
  }

  if (TRADE_ACTIONS.has(type)) {
    if (!isInFranchiseActionWindow(phase, "trade")) {
      return { allowed: false, reason: `${action.type} is not allowed during ${phase}.` };
    }
    const currentWeek = getCurrentWeek(state);
    const deadlineWeek = getTradeDeadlineWeek(state);
    if (currentWeek > deadlineWeek) {
      return { allowed: false, reason: `${action.type} blocked after trade deadline (week ${deadlineWeek}, current week ${currentWeek}).` };
    }
    return { allowed: true };
  }

  if (CONTRACT_ACTIONS.has(type)) {
    if (!isInFranchiseActionWindow(phase, "contract")) {
      return { allowed: false, reason: `${action.type} is not allowed during ${phase}.` };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

export function assertActionPhase(state: GameState, action: AnyGameAction): void {
  const verdict = isActionAllowedInCurrentPhase(state, action);
  if (verdict.allowed) return;
  const reason = verdict.reason ?? `${action.type} is not valid in current phase.`;
  if (import.meta.env.DEV) {
    throw new Error(`phase_guard:${reason}`);
  }
  console.warn(JSON.stringify({ level: "warn", event: "phase_guard.blocked", action: action.type, reason, careerStage: state.careerStage }));
}

export function shouldForcePreseasonCutdownTransition(state: GameState, action: AnyGameAction): boolean {
  if (action.type !== "ADVANCE_WEEK") return false;
  if (state.careerStage !== "PRESEASON") return false;

  const preseasonWeek = Number(state.hub?.preseasonWeek ?? 1);
  const preseasonWeeks = Number(state.hub?.schedule?.preseasonWeeks?.length ?? 0);
  if (preseasonWeeks <= 0) return false;

  return preseasonWeek >= preseasonWeeks;
}
