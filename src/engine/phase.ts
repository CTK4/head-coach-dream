export type PhaseKey =
  | "PHASE_2_RETENTION"
  | "PHASE_3_COMBINE"
  | "PHASE_4_FREE_AGENCY"
  | "DRAFT"
  | "REGULAR_SEASON_WEEK"
  | "UNKNOWN";

function upper(v: unknown) {
  return typeof v === "string" ? v.toUpperCase() : "";
}

export function getPhaseKey(state: any): PhaseKey {
  const raw = state?.phase ?? state?.careerStage ?? state?.seasonPhase ?? state?.hubPhase ?? "UNKNOWN";
  const p = upper(raw);

  if (p.includes("RETENTION") || p.includes("RESIGN") || p.includes("PHASE_2_RETENTION")) return "PHASE_2_RETENTION";
  if (p.includes("COMBINE")) return "PHASE_3_COMBINE";
  if (p.includes("FREE_AGENCY")) return "PHASE_4_FREE_AGENCY";
  if (p.includes("DRAFT")) return "DRAFT";
  if (p.includes("REGULAR") || p.includes("WEEK")) return "REGULAR_SEASON_WEEK";
  return "UNKNOWN";
}

export function isTradesAllowed(state: any): boolean {
  const phase = getPhaseKey(state);
  return phase === "REGULAR_SEASON_WEEK" || phase === "PHASE_4_FREE_AGENCY";
}

export function isReSignAllowed(state: any): boolean {
  return getPhaseKey(state) === "PHASE_2_RETENTION";
}

export function selectCurrentPhase(state: any): PhaseKey {
  return getPhaseKey(state);
}

