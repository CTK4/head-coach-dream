import { describe, expect, it, vi, beforeEach } from "vitest";

// Suppress structured-log output during tests
vi.mock("@/lib/logger", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

// buildRosterIndex is imported by the migration module but not called during
// migrateSaveSchema — mock it to avoid leagueDB initialisation overhead.
vi.mock("@/engine/transactions/applyTransactions", () => ({
  buildRosterIndex: vi.fn(() => ({ playerToTeam: {}, freeAgents: new Set(), teamToPlayers: {} })),
}));

// loadConfigRegistry / validateConfigPins are imported at module level but
// not invoked during the migration path we test here.
vi.mock("@/engine/config/loadConfig", () => ({ loadConfigRegistry: vi.fn(() => ({})) }));
vi.mock("@/engine/config/validateConfig", () => ({ validateConfigPins: vi.fn(() => ({ ok: true })) }));

import { migrateSaveSchema, LATEST_SAVE_SCHEMA_VERSION } from "@/lib/migrations/saveSchema";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

/** Minimum fields a v0 save must have (before migrations). */
function makeV0(overrides: Record<string, unknown> = {}) {
  return {
    phase: "HUB",
    season: 2025,
    week: 5,
    careerStage: "REGULAR_SEASON",
    userTeamId: "BEARS",
    league: { phase: "REGULAR_SEASON", week: 5 },
    hub: { regularSeasonWeek: 5 },
    saveSeed: 42,
    ...overrides,
  };
}

/** A v1 save already has careerSeed and schemaVersion 1. */
function makeV1(overrides: Record<string, unknown> = {}) {
  return {
    ...makeV0(),
    careerSeed: 42,
    schemaVersion: 1,
    ...overrides,
  };
}

/** A v2 save is fully migrated. */
function makeV2(overrides: Record<string, unknown> = {}) {
  return {
    ...makeV1(),
    schemaVersion: 2,
    configVersion: "1",
    calibrationPackId: "DEFAULT",
    simTuningSettings: { difficultyPreset: "NORMAL", realismPreset: "ARCADE" },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// v0 → v2 full chain
// ---------------------------------------------------------------------------

describe("migrateSaveSchema — v0 → v2", () => {
  it("outputs schemaVersion 2 from a v0 save", () => {
    const result = migrateSaveSchema(makeV0() as any);
    expect(result.schemaVersion).toBe(LATEST_SAVE_SCHEMA_VERSION);
    expect(result.schemaVersion).toBe(2);
  });

  it("converts saveSeed to careerSeed", () => {
    const result = migrateSaveSchema(makeV0({ saveSeed: 99 }) as any);
    expect((result as any).careerSeed).toBe(99);
  });

  it("adds configVersion from v0", () => {
    const result = migrateSaveSchema(makeV0() as any);
    expect(typeof (result as any).configVersion).toBe("string");
    expect((result as any).configVersion.length).toBeGreaterThan(0);
  });

  it("adds calibrationPackId from v0", () => {
    const result = migrateSaveSchema(makeV0() as any);
    expect(typeof (result as any).calibrationPackId).toBe("string");
    expect((result as any).calibrationPackId.length).toBeGreaterThan(0);
  });

  it("adds simTuningSettings from v0", () => {
    const result = migrateSaveSchema(makeV0() as any);
    expect(typeof (result as any).simTuningSettings?.difficultyPreset).toBe("string");
    expect(typeof (result as any).simTuningSettings?.realismPreset).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// v1 → v2
// ---------------------------------------------------------------------------

describe("migrateSaveSchema — v1 → v2", () => {
  it("outputs schemaVersion 2 from a v1 save", () => {
    const result = migrateSaveSchema(makeV1() as any);
    expect(result.schemaVersion).toBe(2);
  });

  it("preserves careerSeed that was already set in v1", () => {
    const result = migrateSaveSchema(makeV1({ careerSeed: 123 }) as any);
    expect((result as any).careerSeed).toBe(123);
  });

  it("adds configVersion and calibrationPackId from v1", () => {
    const result = migrateSaveSchema(makeV1() as any);
    expect(typeof (result as any).configVersion).toBe("string");
    expect(typeof (result as any).calibrationPackId).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// v2 → v2 (no-op / idempotence)
// ---------------------------------------------------------------------------

describe("migrateSaveSchema — v2 no-op", () => {
  it("returns schemaVersion 2 unchanged when input is already v2", () => {
    const v2 = makeV2({ configVersion: "custom-v", calibrationPackId: "MY_PACK" });
    const result = migrateSaveSchema(v2 as any);
    expect(result.schemaVersion).toBe(2);
  });

  it("preserves configVersion when already set", () => {
    const v2 = makeV2({ configVersion: "my-version" });
    const result = migrateSaveSchema(v2 as any);
    expect((result as any).configVersion).toBe("my-version");
  });

  it("preserves calibrationPackId when already set", () => {
    const v2 = makeV2({ calibrationPackId: "MY_CAL_PACK" });
    const result = migrateSaveSchema(v2 as any);
    expect((result as any).calibrationPackId).toBe("MY_CAL_PACK");
  });

  it("is idempotent: migrating twice gives the same output", () => {
    const v2 = makeV2();
    const first = migrateSaveSchema(v2 as any);
    const second = migrateSaveSchema(first as any);
    expect(second.schemaVersion).toBe(first.schemaVersion);
    expect((second as any).configVersion).toBe((first as any).configVersion);
    expect((second as any).calibrationPackId).toBe((first as any).calibrationPackId);
  });
});

// ---------------------------------------------------------------------------
// Field preservation
// ---------------------------------------------------------------------------

describe("migrateSaveSchema — field preservation", () => {
  it("preserves season and week through migration", () => {
    // hardenPhaseFields reads league.week first, so all week sources must agree
    const result = migrateSaveSchema(makeV0({
      season: 2027, week: 10,
      league: { phase: "REGULAR_SEASON", week: 10 },
      hub: { regularSeasonWeek: 10 },
    }) as any);
    expect(result.season).toBe(2027);
    expect(result.week).toBe(10);
  });

  it("preserves userTeamId when explicitly set", () => {
    const result = migrateSaveSchema(makeV0({ userTeamId: "COWBOYS" }) as any);
    expect((result as any).userTeamId).toBe("COWBOYS");
  });

  it("preserves arbitrary extra fields not touched by migration", () => {
    const input = { ...makeV0(), customField: "preserved_value" };
    const result = migrateSaveSchema(input as any);
    expect((result as any).customField).toBe("preserved_value");
  });

  it("injects saveId into output when provided", () => {
    const result = migrateSaveSchema(makeV0() as any, "save_001");
    expect((result as any).saveId).toBe("save_001");
  });
});

// ---------------------------------------------------------------------------
// Phase hardening
// ---------------------------------------------------------------------------

describe("migrateSaveSchema — phase hardening", () => {
  it("produces a valid careerStage after migration", () => {
    const result = migrateSaveSchema(makeV0() as any);
    expect(typeof result.careerStage).toBe("string");
    expect(result.careerStage.length).toBeGreaterThan(0);
  });

  it("corrects an invalid careerStage via week-based derivation", () => {
    // hardenPhaseFields reads league.week first, so all week sources must agree
    // week=3 → deriveCareerStageFromWeek(3) → "PRESEASON"
    const input = {
      ...makeV0(),
      careerStage: "COMPLETELY_INVALID_STAGE",
      week: 3,
      league: { phase: "REGULAR_SEASON", week: 3 },
      hub: { regularSeasonWeek: 3 },
    };
    const result = migrateSaveSchema(input as any);
    expect(result.careerStage).toBe("PRESEASON");
  });

  it("clamps an out-of-range week", () => {
    const input = { ...makeV0(), week: 999 };
    const result = migrateSaveSchema(input as any);
    expect(result.week).toBeLessThanOrEqual(23);
    expect(result.week).toBeGreaterThanOrEqual(1);
  });
});
