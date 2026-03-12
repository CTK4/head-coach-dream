import { nextStageForNavigate, stageLabel, stageToRoute } from "@/components/franchise-hub/stageRouting";
import { isReSignAllowed, isTradesAllowed } from "@/engine/phase";
import { getUnifiedPhase, isInFranchiseActionWindow } from "@/engine/phaseUtils";
import type { CareerStage } from "@/types/careerStage";
import type { GameState } from "@/context/GameContext";

export type HubProgressionState = {
  careerStage: CareerStage;
  offseason?: { stepId?: string };
  staff: {
    ocId?: string | null;
    dcId?: string | null;
    stcId?: string | null;
  };
};

export type HubProgressionSummary = {
  nextStage: CareerStage;
  nextLabel: string;
  nextRoute: string;
  advanceText: string;
};

const HUB_COORDINATOR_STAGES: CareerStage[] = [
  "OFFSEASON_HUB",
  "RESIGN",
  "COMBINE",
  "FREE_AGENCY",
  "PRE_DRAFT",
  "DRAFT",
  "TRAINING_CAMP",
  "PRESEASON",
  "CUTDOWNS",
];

export function resolveHubProgression(careerStage: CareerStage): HubProgressionSummary {
  const nextStage = nextStageForNavigate(careerStage);
  const nextLabel = stageLabel(nextStage);
  const nextRoute = stageToRoute(nextStage);
  let advanceText = "ADVANCE PHASE";

  if (careerStage === "FREE_AGENCY") advanceText = "ADVANCE FA DAY";
  else if (careerStage === "COMBINE") advanceText = "ADVANCE COMBINE DAY";
  else if (careerStage === "DRAFT") advanceText = "ADVANCE PICK";
  else if (careerStage === "REGULAR_SEASON") advanceText = "ADVANCE WEEK";
  else if (careerStage === "RESIGN") advanceText = "ADVANCE RE-SIGN DAY";
  else advanceText = `ADVANCE TO ${nextLabel.toUpperCase()}`;

  return { nextStage, nextLabel, nextRoute, advanceText };
}

export function shouldShowCoordinatorHiring(state: HubProgressionState): boolean {
  const missingCoordinators = !state.staff.ocId || !state.staff.dcId || !state.staff.stcId;
  return missingCoordinators && HUB_COORDINATOR_STAGES.includes(state.careerStage);
}

export function getHubActionAvailability(state: HubProgressionState & Record<string, unknown>) {
  return {
    showTrades: isTradesAllowed(state),
    showReSign: isReSignAllowed(state),
    showCoordinatorHiring: shouldShowCoordinatorHiring(state),
  };
}

export function canAccessFreeAgency(state: HubProgressionState & Record<string, unknown>): boolean {
  const phase = getUnifiedPhase(state as GameState);
  return isInFranchiseActionWindow(phase, "free-agency") || state.offseason?.stepId === "FREE_AGENCY";
}

export function canAccessReSign(state: HubProgressionState): boolean {
  return state.careerStage === "RESIGN" || state.offseason?.stepId === "RESIGNING";
}

export function canAccessTrades(state: HubProgressionState & Record<string, unknown>): boolean {
  return isInFranchiseActionWindow(getUnifiedPhase(state as GameState), "trade");
}

export function getHubQuickLinkAvailability(state: HubProgressionState & Record<string, unknown>) {
  return {
    freeAgency: canAccessFreeAgency(state),
    reSign: canAccessReSign(state),
    trades: canAccessTrades(state),
  };
}
