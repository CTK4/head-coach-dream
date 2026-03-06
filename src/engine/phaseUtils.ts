import type { GameState } from "@/context/GameContext";
import type { CareerStage } from "@/types/careerStage";

export type UnifiedPhase = CareerStage | "IN_SEASON" | "POSTSEASON" | "OFFSEASON_TRANSITION";

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

const LEAGUE_POSTSEASON_PHASES = new Set<string>(["WILD_CARD", "DIVISIONAL", "CONFERENCE", "CHAMPIONSHIP", "SUPER_BOWL"]);
const LEAGUE_IN_SEASON_PHASES = new Set<string>(["REGULAR_SEASON", "REGULAR_SEASON_GAMEPLAN", "REGULAR_SEASON_GAME"]);
const LEAGUE_OFFSEASON_TRANSITION_PHASES = new Set<string>(["SEASON_COMPLETE", "STAFF_EVAL", "POST_DRAFT", "OFFSEASON_COMPLETE"]);

function deriveCareerStageFromWeek(week: number): CareerStage {
  if (week <= 0) return "OFFSEASON_HUB";
  if (week <= 4) return "PRESEASON";
  if (week <= 18) return "REGULAR_SEASON";
  return "PLAYOFFS";
}

function getCurrentWeek(state: GameState): number {
  const week = Number(state.league?.week ?? state.hub?.regularSeasonWeek ?? state.week ?? 1);
  if (!Number.isFinite(week)) return 1;
  return Math.floor(week);
}

export function getUnifiedPhase(state: GameState): UnifiedPhase {
  const careerStage = String(state.careerStage ?? "");
  if (VALID_CAREER_STAGES.has(careerStage)) {
    return careerStage as CareerStage;
  }

  const leaguePhase = String(state.league?.phase ?? "");
  const derivedCareerStage = deriveCareerStageFromWeek(getCurrentWeek(state));

  if (derivedCareerStage !== "PLAYOFFS" && LEAGUE_POSTSEASON_PHASES.has(leaguePhase)) {
    return "POSTSEASON";
  }
  if (derivedCareerStage === "REGULAR_SEASON" && LEAGUE_IN_SEASON_PHASES.has(leaguePhase)) {
    return "IN_SEASON";
  }
  if (derivedCareerStage === "OFFSEASON_HUB" && LEAGUE_OFFSEASON_TRANSITION_PHASES.has(leaguePhase)) {
    return "OFFSEASON_TRANSITION";
  }

  return derivedCareerStage;
}

export function isInFranchiseActionWindow(phase: UnifiedPhase, actionCategory: "free-agency" | "draft" | "trade" | "contract"): boolean {
  if (actionCategory === "free-agency") {
    return phase === "FREE_AGENCY";
  }

  if (actionCategory === "draft") {
    return phase === "DRAFT";
  }

  if (actionCategory === "trade") {
    return phase === "REGULAR_SEASON" || phase === "PRESEASON" || phase === "FREE_AGENCY" || phase === "PRE_DRAFT" || phase === "IN_SEASON";
  }

  return phase !== "PLAYOFFS" && phase !== "POSTSEASON" && phase !== "FIRED";
}

