import type { CareerStage } from "@/context/GameContext";

export const CAREER_STAGE_ORDER: CareerStage[] = [
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
];

export function nextCareerStage(stage: CareerStage): CareerStage {
  const idx = CAREER_STAGE_ORDER.indexOf(stage);
  if (idx < 0 || idx === CAREER_STAGE_ORDER.length - 1) return stage;
  return CAREER_STAGE_ORDER[idx + 1];
}

export function stageToRoute(stage: CareerStage): string {
  switch (stage) {
    case "SEASON_AWARDS":
      return "/hub";
    case "ASSISTANT_HIRING":
      return "/staff/hire";
    case "STAFF_CONSTRUCTION":
      return "/hub/assistant-hiring";
    case "ROSTER_REVIEW":
      return "/hub/roster-audit";
    case "RESIGN":
      return "/hub/re-sign";
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
  if (stage === "OFFSEASON_HUB") return "ASSISTANT_HIRING";
  return nextCareerStage(stage);
}

export function stageLabel(stage: CareerStage): string {
  switch (stage) {
    case "OFFSEASON_HUB":
      return "Offseason Hub";
    case "SEASON_AWARDS":
      return "Season Awards";
    case "ASSISTANT_HIRING":
      return "Assistant Hiring";
    case "STAFF_CONSTRUCTION":
      return "Staff Construction";
    case "ROSTER_REVIEW":
      return "Roster Review";
    case "RESIGN":
      return "Re-Sign Players";
    case "COMBINE":
      return "Combine";
    case "TAMPERING":
      return "Tampering";
    case "FREE_AGENCY":
      return "Free Agency";
    case "PRE_DRAFT":
      return "Pre-Draft";
    case "DRAFT":
      return "Rookie Draft";
    case "TRAINING_CAMP":
      return "Training Camp";
    case "PRESEASON":
      return "Preseason";
    case "CUTDOWNS":
      return "Cutdowns";
    case "REGULAR_SEASON":
      return "Regular Season";
    default:
      return stage.replace(/_/g, " ");
  }
}
