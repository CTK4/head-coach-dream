import type { GameState } from "@/context/GameContext";

const OFFSEASON_STAGE_FALLBACKS: Record<string, string> = {
  HIRE_STAFF: "Offseason",
  ROSTER_REVIEW: "Offseason",
  COMBINE: "Offseason",
  PRE_DRAFT: "Offseason",
  DRAFT: "Offseason",
};

function toTitleCase(value: string): string {
  return value
    .replaceAll(/[_-]+/g, " ")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getPhaseLabel(state: GameState): string {
  const hubLabel = (state as GameState & { hub?: { phaseLabel?: string | null } }).hub?.phaseLabel;
  if (typeof hubLabel === "string" && hubLabel.trim()) return hubLabel;

  const offseasonPhase = (state as GameState & { offseason?: { phase?: string | null } }).offseason?.phase;
  if (typeof offseasonPhase === "string" && offseasonPhase.trim()) return toTitleCase(offseasonPhase);

  const currentPhase = (state as GameState & { offseason?: { currentPhase?: string | null } }).offseason?.currentPhase;
  if (typeof currentPhase === "string" && currentPhase.trim()) return toTitleCase(currentPhase);

  return OFFSEASON_STAGE_FALLBACKS[state.careerStage] ?? "Offseason";
}
