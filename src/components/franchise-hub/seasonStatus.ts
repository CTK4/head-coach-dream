import { getPhaseLabel } from "@/components/franchise-hub/offseasonLabel";
import type { CareerStage, GameState } from "@/context/GameContext";

const OFFSEASON_STAGES = new Set<CareerStage | string>(["HIRE_STAFF", "ROSTER_REVIEW", "COMBINE", "PRE_DRAFT", "DRAFT", "OFFSEASON_HUB"]);

export function getLeagueWeek(state: GameState): number | null {
  const raw = (state.league as { week?: unknown; currentWeek?: unknown })?.week
    ?? (state.league as { currentWeek?: unknown })?.currentWeek
    ?? state.week
    ?? (state.hub as { week?: unknown })?.week;
  return typeof raw === "number" && Number.isFinite(raw) ? raw : null;
}

export function isOffseasonByStageOrLabel(state: GameState): boolean {
  if (OFFSEASON_STAGES.has(state.careerStage)) return true;
  return /offseason/i.test(getPhaseLabel(state));
}

export function isRegularSeason(state: GameState): boolean {
  const week = getLeagueWeek(state);
  if (week !== null) return week >= 1 && !isOffseasonByStageOrLabel(state);

  const phaseId = String((state.hub as { phaseId?: string })?.phaseId ?? "").toUpperCase();
  if (phaseId) return phaseId.includes("REG") || phaseId === "REGULAR_SEASON";

  return !isOffseasonByStageOrLabel(state);
}
