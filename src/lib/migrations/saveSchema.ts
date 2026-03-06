import type { GameState } from "@/context/GameContext";
import { getUserTeamId } from "@/lib/userTeam";
import { DEFAULT_CALIBRATION_PACK_ID, DEFAULT_CONFIG_VERSION } from "@/engine/config/configRegistry";
import { loadConfigRegistry } from "@/engine/config/loadConfig";
import { validateConfigPins } from "@/engine/config/validateConfig";
import type { CareerStage } from "@/types/careerStage";
import type { LeaguePhase } from "@/engine/leaguePhase";
import { TRADE_DEADLINE_DEFAULT_WEEK, resolveTradeDeadlineWeek } from "@/engine/tradeDeadline";
import { logInfo } from "@/lib/logger";

export const LATEST_SAVE_SCHEMA_VERSION = 2;

export type SaveValidationErrorCode =
  | "INVALID_ROOT"
  | "INVALID_PHASE"
  | "INVALID_CAREER_STAGE"
  | "INVALID_OFFSEASON_STEP"
  | "INVALID_SEASON"
  | "INVALID_WEEK"
  | "INVALID_TEAM"
  | "INVALID_COACH"
  | "INVALID_CONFIG_PIN";

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
  "FIRED",
  "REHIRING",
]);

// ---------------------------------------------------------------------------


const VALID_LEAGUE_PHASES = new Set<string>([
  "PRESEASON",
  "REGULAR_SEASON",
  "REGULAR_SEASON_GAMEPLAN",
  "REGULAR_SEASON_GAME",
  "WILD_CARD",
  "DIVISIONAL",
  "CONFERENCE",
  "SUPER_BOWL",
  "OFFSEASON",
]);

function deriveCareerStageFromWeek(week: number): CareerStage {
  if (week <= 0) return "OFFSEASON_HUB";
  if (week <= 4) return "PRESEASON";
  if (week <= 18) return "REGULAR_SEASON";
  return "PLAYOFFS";
}

function clampWeek(rawWeek: unknown): number {
  const week = Number(rawWeek);
  if (!Number.isFinite(week)) return 1;
  return Math.max(1, Math.min(23, Math.floor(week)));
}

function hardenPhaseFields(state: Partial<GameState>): Partial<GameState> {
  const next: any = { ...state };
  const safeWeek = clampWeek(next?.league?.week ?? next?.hub?.regularSeasonWeek ?? next?.week ?? 1);

  const hasValidCareerStage = VALID_CAREER_STAGES.has(String(next.careerStage ?? ""));
  if (!hasValidCareerStage) {
    next.careerStage = deriveCareerStageFromWeek(safeWeek);

    if (next?.telemetry) {
      logInfo("save.phase.normalized_from_week", {
        meta: {
          week: safeWeek,
          leaguePhase: String(next?.league?.phase ?? ""),
          derivedCareerStage: String(next.careerStage),
        },
      });
    }
  }

  const league = { ...(next.league ?? {}) };
  const leaguePhase = String(league.phase ?? "");
  if (!VALID_LEAGUE_PHASES.has(leaguePhase)) {
    league.phase = (safeWeek <= 4 ? "PRESEASON" : safeWeek <= 18 ? "REGULAR_SEASON" : "WILD_CARD") as LeaguePhase;
  }

  league.week = safeWeek;
  league.tradeDeadlineWeek = resolveTradeDeadlineWeek(league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK);
  next.league = league;

  const hub = { ...(next.hub ?? {}) };
  hub.regularSeasonWeek = clampWeek(hub.regularSeasonWeek ?? safeWeek);
  next.hub = hub;
  next.week = safeWeek;

  return next;
}

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

function migrateV1toV2(state: Partial<GameState>): Partial<GameState> {
  const next = { ...state };
  (next as any).configVersion = String((next as any).configVersion ?? DEFAULT_CONFIG_VERSION);
  (next as any).calibrationPackId = String((next as any).calibrationPackId ?? DEFAULT_CALIBRATION_PACK_ID);
  return { ...next, schemaVersion: 2 };
}

/** Ordered list of migrations. Index 0 upgrades schema version 0 → 1, etc. */
const MIGRATIONS: MigrationFn[] = [
  migrateV0toV1,
  migrateV1toV2,
  // Add future migrations here: migrateV2toV3, migrateV3toV4, …
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

  next = hardenPhaseFields(next);

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

  // Keep a single declaration here; duplicate declarations break esbuild in production builds.
  const teamId = getUserTeamId(state);
  if (!teamId || typeof teamId !== "string") {
    return { ok: false, code: "INVALID_TEAM", message: "Team assignment is missing." };
  }

  if (!(state as any).coach || typeof (state as any).coach.name !== "string") {
    return { ok: false, code: "INVALID_COACH", message: "Coach data is missing or invalid." };
  }

  const loadedConfig = loadConfigRegistry();
  if (!loadedConfig.ok) {
    return { ok: false, code: "INVALID_CONFIG_PIN", message: loadedConfig.validation.message };
  }

  const pinResult = validateConfigPins(loadedConfig.registry, {
    configVersion: (state as any).configVersion,
    calibrationPackId: (state as any).calibrationPackId,
  });
  if (!pinResult.ok) {
    return { ok: false, code: "INVALID_CONFIG_PIN", message: pinResult.message };
  }

  return { ok: true };
}

export function getUserTeamId(state: Partial<GameState>): string | null {
  const teamId = (state as any).acceptedOffer?.teamId ?? (state as any).userTeamId ?? (state as any).teamId;
  return typeof teamId === "string" && teamId.trim().length > 0 ? teamId : null;
}
