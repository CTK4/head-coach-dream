import type { GameState } from "@/context/GameContext";

export const LATEST_SAVE_SCHEMA_VERSION = 1;

export type SaveValidationErrorCode =
  | "INVALID_ROOT"
  | "INVALID_PHASE"
  | "INVALID_OFFSEASON_STEP"
  | "INVALID_SEASON"
  | "INVALID_WEEK"
  | "INVALID_TEAM"
  | "INVALID_COACH";

export type SaveValidationResult =
  | { ok: true }
  | { ok: false; code: SaveValidationErrorCode; message: string };

const VALID_PHASES = new Set([
  "CREATE",
  "WEEK",
  "GAME",
  "RESULT",
  "OFFSEASON",
  "OFFSEASON_HUB",
  "SEASON_AWARDS",
  "PLAYOFFS",
  "REGULAR_SEASON",
  "PRESEASON",
  "TRAINING_CAMP",
  "FREE_AGENCY",
  "RESIGN",
  "COMBINE",
  "DRAFT",
]);

const VALID_OFFSEASON_STEPS = new Set([
  "RESIGNING",
  "COMBINE",
  "TAMPERING",
  "FREE_AGENCY",
  "PRE_DRAFT",
  "DRAFT",
  "ROOKIE_DEALS",
  "TRAINING_CAMP",
  "PRESEASON",
  "CUT_DOWNS",
]);

function toNum(value: unknown): number {
  return Number(value);
}

export function migrateSaveSchema(state: Partial<GameState>, saveId?: string): GameState {
  const schemaVersion = Number((state as GameState).schemaVersion ?? 0);
  const next: GameState = {
    ...(state as GameState),
    schemaVersion: Number.isFinite(schemaVersion) ? Math.max(0, schemaVersion) : 0,
    saveId: state.saveId ?? saveId,
  };

  if (!Number.isFinite(Number(next.careerSeed))) {
    const baseSaveSeed = Number(next.saveSeed ?? 1);
    next.careerSeed = baseSaveSeed ^ 0x85ebca6b;
  }

  if (next.schemaVersion < LATEST_SAVE_SCHEMA_VERSION) {
    next.schemaVersion = LATEST_SAVE_SCHEMA_VERSION;
  }

  if (saveId && !next.saveId) {
    next.saveId = saveId;
  }

  return next;
}

export function validateCriticalSaveState(state: Partial<GameState>): SaveValidationResult {
  if (!state || typeof state !== "object") {
    return { ok: false, code: "INVALID_ROOT", message: "Save data is not an object." };
  }

  const phase = String(state.phase ?? "");
  if (!VALID_PHASES.has(phase)) {
    return { ok: false, code: "INVALID_PHASE", message: "Save phase is invalid or missing." };
  }

  const offseasonStep = String(state.offseason?.stepId ?? "");
  if (offseasonStep && !VALID_OFFSEASON_STEPS.has(offseasonStep)) {
    return { ok: false, code: "INVALID_OFFSEASON_STEP", message: "Offseason step is invalid." };
  }

  const season = toNum(state.season);
  if (!Number.isFinite(season) || season < 1) {
    return { ok: false, code: "INVALID_SEASON", message: "Season must be a positive number." };
  }

  const week = toNum(state.hub?.regularSeasonWeek ?? state.week ?? 1);
  if (!Number.isFinite(week) || week < 0) {
    return { ok: false, code: "INVALID_WEEK", message: "Week value is invalid." };
  }

  const teamId = state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId;
  if (!teamId || typeof teamId !== "string") {
    return { ok: false, code: "INVALID_TEAM", message: "Team assignment is missing." };
  }

  if (!state.coach || typeof state.coach.name !== "string") {
    return { ok: false, code: "INVALID_COACH", message: "Coach data is missing or invalid." };
  }

  return { ok: true };
}
