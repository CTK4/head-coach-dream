import type { GameState } from "@/context/GameContext";
import type { CareerStage } from "@/types/careerStage";
import { logError } from "@/lib/logger";

export type UnifiedPhase = CareerStage;
type LegacyUnifiedHint = "IN_SEASON" | "POSTSEASON" | "OFFSEASON_TRANSITION";

const VALID_CAREER_STAGES = new Set<string>([
  "OFFSEASON_HUB",
  "SEASON_AWARDS",
  "ASSISTANT_HIRING",
  "STAFF_CONSTRUCTION",
  "ROSTER_REVIEW",
  "RESIGN",
  "COMBINE",
  "TAMPERING",
  "FREE_AGENCY",
  "PRE_DRAFT",
  "DRAFT",
  "TRAINING_CAMP",
  "PRESEASON",
  "CUTDOWNS",
  "REGULAR_SEASON",
  "PLAYOFFS",
  "FIRED",
  "REHIRING",
]);

export function getUnifiedPhase(state: GameState): UnifiedPhase {
  const careerStage = String(state.careerStage ?? "");
  if (VALID_CAREER_STAGES.has(careerStage)) {
    return careerStage as CareerStage;
  }

  const msg = `invalid careerStage '${careerStage || "(empty)"}' with unified phase enforcement`;
  if (import.meta.env.DEV) {
    throw new Error(`phase_utils:${msg}`);
  }

  logError("phase_utils.invalid_career_stage", { msg, careerStage: state.careerStage });

  return "OFFSEASON_HUB";
}

function normalizeLegacyPhaseHint(phase: UnifiedPhase | LegacyUnifiedHint): UnifiedPhase {
  if (phase === "IN_SEASON") return "REGULAR_SEASON";
  if (phase === "POSTSEASON") return "PLAYOFFS";
  if (phase === "OFFSEASON_TRANSITION") return "OFFSEASON_HUB";
  return phase;
}

export function isInFranchiseActionWindow(phase: UnifiedPhase | LegacyUnifiedHint, actionCategory: "free-agency" | "draft" | "trade" | "contract"): boolean {
  const normalizedPhase = normalizeLegacyPhaseHint(phase);

  if (actionCategory === "free-agency") {
    return normalizedPhase === "FREE_AGENCY";
  }

  if (actionCategory === "draft") {
    return normalizedPhase === "DRAFT";
  }

  if (actionCategory === "trade") {
    return normalizedPhase === "REGULAR_SEASON" || normalizedPhase === "PRESEASON" || normalizedPhase === "FREE_AGENCY" || normalizedPhase === "PRE_DRAFT";
  }

  return normalizedPhase !== "PLAYOFFS" && normalizedPhase !== "FIRED";
}
