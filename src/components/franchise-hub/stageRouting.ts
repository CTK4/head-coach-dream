import type { CareerStage } from "@/context/GameContext";

export function stageToRoute(stage: CareerStage): string {
  switch (stage) {
    case "STAFF_CONSTRUCTION":
      return "/hub/assistant-hiring";
    case "ROSTER_REVIEW":
      return "/hub/roster-audit";
    case "RESIGN":
      return "/hub/resign";
    case "COMBINE":
      return "/hub/combine";
    case "TAMPERING":
      return "/hub/tampering";
    case "FREE_AGENCY":
      return "/hub/free-agency";
    case "PRE_DRAFT":
      return "/hub/pre-draft";
    case "DRAFT":
      return "/hub/draft";
    case "TRAINING_CAMP":
      return "/hub/training-camp";
    case "PRESEASON":
      return "/hub/preseason";
    case "CUTDOWNS":
      return "/hub/cutdowns";
    case "REGULAR_SEASON":
      return "/hub/regular-season";
    default:
      return "/hub";
  }
}

export function nextStageForNavigate(stage: CareerStage): CareerStage {
  if (stage === "OFFSEASON_HUB") return "STAFF_CONSTRUCTION";
  return stage;
}

export function stageLabel(stage: CareerStage): string {
  return stage.replaceAll("_", " ");
}
