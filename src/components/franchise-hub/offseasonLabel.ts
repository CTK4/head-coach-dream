import { stageLabel } from "@/components/franchise-hub/stageRouting";
import type { GameState } from "@/context/GameContext";

const OFFSEASON_CAREER_STAGES = new Set(["HIRE_STAFF", "ROSTER_REVIEW", "COMBINE", "PRE_DRAFT", "DRAFT"]);

type OptionalPhaseState = {
  hub?: { phaseLabel?: string };
  offseason?: { phase?: unknown; currentPhase?: unknown };
};

function toTitleCase(value: string): string {
  const normalized = stageLabel(value as never).toLowerCase();
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getPhaseLabel(state: GameState): string {
  const phaseState = state as GameState & OptionalPhaseState;

  if (phaseState.hub?.phaseLabel) return phaseState.hub.phaseLabel;

  if (typeof phaseState.offseason?.phase === "string" && phaseState.offseason.phase.trim()) {
    return toTitleCase(phaseState.offseason.phase);
  }

  if (typeof phaseState.offseason?.currentPhase === "string" && phaseState.offseason.currentPhase.trim()) {
    return toTitleCase(phaseState.offseason.currentPhase);
  }

  if (OFFSEASON_CAREER_STAGES.has(state.careerStage)) return "Offseason";
  return "Offseason";
}
