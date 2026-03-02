import type { CareerStage, GameState, OffseasonState } from "@/context/GameContext";
import type { OffseasonStepId } from "@/engine/offseason";

export type DevGate =
  | "OFFSEASON_HUB"
  | "RESIGN"
  | "COMBINE"
  | "TAMPERING"
  | "FREE_AGENCY"
  | "PRE_DRAFT"
  | "DRAFT"
  | "TRAINING_CAMP"
  | "PRESEASON"
  | "CUTDOWNS"
  | "REGULAR_SEASON";

const GATE_TO_STAGE: Record<DevGate, CareerStage> = {
  OFFSEASON_HUB: "OFFSEASON_HUB",
  RESIGN: "RESIGN",
  COMBINE: "COMBINE",
  TAMPERING: "TAMPERING",
  FREE_AGENCY: "FREE_AGENCY",
  PRE_DRAFT: "PRE_DRAFT",
  DRAFT: "DRAFT",
  TRAINING_CAMP: "TRAINING_CAMP",
  PRESEASON: "PRESEASON",
  CUTDOWNS: "CUTDOWNS",
  REGULAR_SEASON: "REGULAR_SEASON",
};

const GATE_TO_STEP: Partial<Record<DevGate, OffseasonStepId>> = {
  RESIGN: "RESIGNING",
  COMBINE: "COMBINE",
  TAMPERING: "TAMPERING",
  FREE_AGENCY: "FREE_AGENCY",
  PRE_DRAFT: "PRE_DRAFT",
  DRAFT: "DRAFT",
  TRAINING_CAMP: "TRAINING_CAMP",
  PRESEASON: "PRESEASON",
  CUTDOWNS: "CUT_DOWNS",
};

export function applyDevGate(state: GameState, gate: DevGate): GameState {
  const careerStage = GATE_TO_STAGE[gate] ?? "OFFSEASON_HUB";
  const stepId = GATE_TO_STEP[gate] ?? state.offseason.stepId;
  const offseason: OffseasonState = { ...state.offseason, stepId };
  const phase = "HUB";
  return { ...state, phase, careerStage, offseason };
}
