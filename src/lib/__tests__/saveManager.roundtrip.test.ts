import { beforeEach, describe, expect, it } from "vitest";
import { createInitialStateForTests, type GameState } from "@/context/GameContext";
import { createSaveManager } from "@/lib/saveManager";
import { runGoldenSeason } from "@/testHarness/goldenSeasonRunner";
import { stableDeterminismHash, stableIntegrityHash } from "@/testHarness/stateHash";

class LocalStorageMock {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

function saveAndLoad(saveManager: ReturnType<typeof createSaveManager>, saveId: string, state: GameState): GameState {
  saveManager.syncCurrentSave({ ...state, saveId }, saveId);
  const loaded = saveManager.loadSaveResult(saveId);
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) throw new Error("save load failed");
  return loaded.state;
}

describe("saveManager round trip at golden checkpoints", () => {
  let storage: LocalStorageMock;
  let saveManager: ReturnType<typeof createSaveManager>;

  beforeEach(() => {
    storage = new LocalStorageMock();
    saveManager = createSaveManager({ storage });
  });

  it("preserves determinism and integrity hashes at offseason, midseason, and postseason checkpoints", () => {
    const offseasonState = runGoldenSeason({ careerSeed: 1001, userTeamId: "MILWAUKEE_NORTHSHORE", strategy: { resignTopN: 3 }, stopAt: "OFFSEASON_DONE" }).finalState;
    const midState = runGoldenSeason({ careerSeed: 1001, userTeamId: "MILWAUKEE_NORTHSHORE", strategy: { resignTopN: 3 }, stopAt: "WEEK_9" }).finalState;
    const postState = runGoldenSeason({ careerSeed: 1001, userTeamId: "MILWAUKEE_NORTHSHORE", strategy: { resignTopN: 3 }, stopAt: "POSTSEASON" }).finalState;

    for (const { saveId, state } of [
      { saveId: "golden-offseason", state: offseasonState },
      { saveId: "golden-midseason", state: midState },
      { saveId: "golden-postseason", state: postState },
    ]) {
      const loaded = saveAndLoad(saveManager, saveId, state);
      const loadedAgain = saveAndLoad(saveManager, `${saveId}-again`, loaded);
      expect(stableDeterminismHash(loaded)).toBe(stableDeterminismHash(state));
      expect(stableDeterminismHash(loadedAgain)).toBe(stableDeterminismHash(loaded));
      expect(stableIntegrityHash(loadedAgain)).toBe(stableIntegrityHash(loaded));
      expect(loaded.configVersion).toBe(state.configVersion);
      expect(loaded.calibrationPackId).toBe(state.calibrationPackId);
      expect(loaded.simTuningSettings).toEqual(state.simTuningSettings);
    }

    expect(Number(midState.hub.regularSeasonWeek ?? midState.week ?? 0)).toBeGreaterThanOrEqual(9);
    expect(postState.careerStage).toBe("SEASON_AWARDS");
  }, 300_000);

  it("restores from backup when primary save is corrupted", () => {
    const state = runGoldenSeason({ careerSeed: 2020, userTeamId: "MILWAUKEE_NORTHSHORE", stopAt: "OFFSEASON_DONE" }).finalState;

    saveManager.syncCurrentSave({ ...state, saveId: "corrupt-me" }, "corrupt-me");
    const canonicalBeforeCorruption = saveManager.loadSaveResult("corrupt-me");
    expect(canonicalBeforeCorruption.ok).toBe(true);
    if (!canonicalBeforeCorruption.ok) throw new Error("expected canonical save before corruption");

    saveManager.syncCurrentSave({ ...canonicalBeforeCorruption.state, saveId: "corrupt-me" }, "corrupt-me");
    storage.setItem("hc_career_save__corrupt-me", "{not valid json");

    const result = saveManager.loadSaveResult("corrupt-me");
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(stableDeterminismHash(result.state)).toBe(stableDeterminismHash(canonicalBeforeCorruption.state));
      expect(stableIntegrityHash(result.state)).toBe(stableIntegrityHash(canonicalBeforeCorruption.state));
    }
  }, 120_000);

  it("round-trips telemetry aggregate containers", () => {
    const base = createInitialStateForTests();
    const state = {
      ...base,
      telemetry: {
        ...(base.telemetry ?? { playLogsByGameKey: {}, gameAggsByGameKey: {}, seasonAgg: { version: 1, byTeamId: {}, appliedGameKeys: {} } }),
        gameAggsByGameKey: {
          "2026:REGULAR_SEASON:1:A:B": {
            version: 1,
            season: 2026,
            weekType: "REGULAR_SEASON",
            weekNumber: 1,
            homeTeamId: "A",
            awayTeamId: "B",
            byTeamId: {
              A: { passAttempts: 25, completions: 15, passYards: 250, interceptions: 1, sacksTaken: 2, rushAttempts: 20, rushYards: 95 },
              B: { passAttempts: 20, completions: 12, passYards: 180, interceptions: 0, sacksTaken: 1, rushAttempts: 24, rushYards: 110 },
            },
          },
        },
        seasonAgg: {
          version: 1,
          appliedGameKeys: { "2026:REGULAR_SEASON:1:A:B": true },
          byTeamId: {
            A: {
              games: 1,
              totals: { passAttempts: 25, completions: 15, passYards: 250, interceptions: 1, sacksTaken: 2, rushAttempts: 20, rushYards: 95 },
              rollingLast4: [{ gameKey: "2026:REGULAR_SEASON:1:A:B", passAttempts: 25, completions: 15, passYards: 250, interceptions: 1, sacksTaken: 2, rushAttempts: 20, rushYards: 95 }],
              rollingLast8: [{ gameKey: "2026:REGULAR_SEASON:1:A:B", passAttempts: 25, completions: 15, passYards: 250, interceptions: 1, sacksTaken: 2, rushAttempts: 20, rushYards: 95 }],
            },
          },
        },
      },
    } as GameState;

    const loaded = saveAndLoad(saveManager, "telemetry-roundtrip", state);
    expect(loaded.telemetry?.seasonAgg.appliedGameKeys["2026:REGULAR_SEASON:1:A:B"]).toBe(true);
    expect(loaded.telemetry?.gameAggsByGameKey["2026:REGULAR_SEASON:1:A:B"]?.byTeamId.A.passYards).toBe(250);
  });
});
