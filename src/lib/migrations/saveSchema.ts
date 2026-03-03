import type { GameState } from "@/context/GameContext";
import { getUserTeamId } from "@/lib/userTeam";

export const LATEST_SAVE_SCHEMA_VERSION = 1;

export type SaveValidationErrorCode =
  | "INVALID_ROOT"
  | "INVALID_PHASE"
  | "INVALID_CAREER_STAGE"
  | "INVALID_OFFSEASON_STEP"
  | "INVALID_SEASON"
  | "INVALID_WEEK"
  | "INVALID_TEAM"
  | "INVALID_COACH";

export type SaveValidationResult =
  | { ok: true }
  | { ok: false; code: SaveValidationErrorCode; message: string };

// Root cause note:
// - `state.phase` is the app routing phase (GamePhase).
// - `state.careerStage` is the career progression stage (CareerStage).
// Mixing CareerStage values into phase validation and omitting "HUB" caused
// active runtime saves to fail with INVALID_PHASE.
const VALID_APP_PHASES = new Set<string>([
  "CREATE",
  "BACKGROUND",
  "INTERVIEWS",
  "OFFERS",
  "COORD_HIRING",
  "HUB",
]);

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
]);

// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Chained migration functions — one per schema version boundary.
// Each function receives the state after the previous migration and returns
// the state at the new version. Add a new function here for every breaking
// schema change so saves from any prior version are incrementally upgraded.
// ---------------------------------------------------------------------------

type MigrationFn = (state: Partial<GameState>) => Partial<GameState>;

/**
 * v0 → v1: Normalise `saveSeed` → `careerSeed`.
 * In v0 saves the seed was stored as `saveSeed`; v1 standardises on `careerSeed`.
 */
function migrateV0toV1(state: Partial<GameState>): Partial<GameState> {
  const next = { ...state };
  if (!Number.isFinite(Number(next.careerSeed))) {
    (next as any).careerSeed = Number((next as any).saveSeed ?? 1);
  }
  if (!(next as any).userTeamId) {
    const userTeamId = getUserTeamId(next as GameState);
    if (userTeamId) (next as any).userTeamId = userTeamId;
  }
  return { ...next, schemaVersion: 1 };
}

/** Ordered list of migrations. Index 0 upgrades schema version 0 → 1, etc. */
const MIGRATIONS: MigrationFn[] = [
  migrateV0toV1,
  // Add future migrations here: migrateV1toV2, migrateV2toV3, …
];

export function migrateSaveSchema(state: Partial<GameState>, saveId?: string): GameState {
  let schemaVersion = Number.isFinite(Number((state as any).schemaVersion))
    ? Math.max(0, Number((state as any).schemaVersion))
    : 0;

  let next: Partial<GameState> = { ...state };

  // Apply each migration in order starting from the save's current version.
  for (let v = schemaVersion; v < LATEST_SAVE_SCHEMA_VERSION; v++) {
    const migrate = MIGRATIONS[v];
    if (migrate) {
      next = migrate(next);
    }
  }

  // Ensure top-level metadata is always present.
  if (saveId) {
    (next as any).saveId = saveId;
  }

  if (!(next as any).userTeamId) {
    const userTeamId = getUserTeamId(next as GameState);
    if (userTeamId) (next as any).userTeamId = userTeamId;
  }

  (next as any).schemaVersion = LATEST_SAVE_SCHEMA_VERSION;

  return next as GameState;
}

export function validateCriticalSaveState(state: Partial<GameState>): SaveValidationResult {
  if (!state || typeof state !== "object") {
    return { ok: false, code: "INVALID_ROOT", message: "Save data is not an object." };
  }

  const phase = String((state as any).phase ?? "");
  if (!VALID_APP_PHASES.has(phase)) {
    return {
      ok: false,
      code: "INVALID_PHASE",
      message: `Save phase '${phase}' is invalid or missing. Expected one of: ${[...VALID_APP_PHASES].join(", ")}.`,
    };
  }

  const careerStage = String((state as any).careerStage ?? "");
  if (careerStage && !VALID_CAREER_STAGES.has(careerStage)) {
    return { ok: false, code: "INVALID_CAREER_STAGE", message: "Career stage is invalid." };
  }

  const offseasonStep = String((state as any).offseason?.stepId ?? "");
  if (offseasonStep && !VALID_OFFSEASON_STEPS.has(offseasonStep)) {
    return { ok: false, code: "INVALID_OFFSEASON_STEP", message: "Offseason step is invalid." };
  }

  const season = toNum((state as any).season);
  if (!Number.isFinite(season) || season < 1) {
    return { ok: false, code: "INVALID_SEASON", message: "Season must be a positive number." };
  }

  const week = toNum((state as any).hub?.regularSeasonWeek ?? (state as any).week ?? 1);
  if (!Number.isFinite(week) || week < 0) {
    return { ok: false, code: "INVALID_WEEK", message: "Week value is invalid." };
  }

  const teamId = getUserTeamId(state as GameState);
  if (!teamId || typeof teamId !== "string") {
    return { ok: false, code: "INVALID_TEAM", message: "Team assignment is missing." };
  }

  if (!(state as any).coach || typeof (state as any).coach.name !== "string") {
    return { ok: false, code: "INVALID_COACH", message: "Coach data is missing or invalid." };
  }

  return { ok: true };
}
