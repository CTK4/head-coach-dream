import { beforeEach, describe, expect, it } from "vitest";
import type { GameState } from "@/context/GameContext";
import { loadSaveResult, syncCurrentSave } from "@/lib/saveManager";
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

function saveAndLoad(saveId: string, state: GameState): GameState {
  syncCurrentSave({ ...state, saveId }, saveId);
  const loaded = loadSaveResult(saveId);
  expect(loaded.ok).toBe(true);
  if (!loaded.ok) throw new Error("save load failed");
  return loaded.state;
}

describe("saveManager round trip at golden checkpoints", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", {
      value: new LocalStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it("preserves determinism and integrity hashes at offseason, midseason, and postseason checkpoints", () => {
    const offseasonState = runGoldenSeason({
      careerSeed: 1001,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      strategy: { resignTopN: 3 },
      stopAt: "OFFSEASON_DONE",
    }).finalState;

    const midState = runGoldenSeason({
      careerSeed: 1001,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      strategy: { resignTopN: 3 },
      stopAt: "WEEK_9",
    }).finalState;

    const postState = runGoldenSeason({
      careerSeed: 1001,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      strategy: { resignTopN: 3 },
      stopAt: "POSTSEASON",
    }).finalState;

    const cases: Array<{ saveId: string; state: GameState }> = [
      { saveId: "golden-offseason", state: offseasonState },
      { saveId: "golden-midseason", state: midState },
      { saveId: "golden-postseason", state: postState },
    ];

    for (const { saveId, state } of cases) {
      const loaded = saveAndLoad(saveId, state);
      const loadedAgain = saveAndLoad(`${saveId}-again`, loaded);
      expect(stableDeterminismHash(loaded)).toBe(stableDeterminismHash(state));
      expect(stableDeterminismHash(loadedAgain)).toBe(stableDeterminismHash(loaded));
      expect(stableIntegrityHash(loadedAgain)).toBe(stableIntegrityHash(loaded));
    }

    expect(Number(midState.hub.regularSeasonWeek ?? midState.week ?? 0)).toBeGreaterThanOrEqual(9);
    expect(postState.careerStage).toBe("SEASON_AWARDS");
  });

  it("restores from backup when primary save is corrupted", () => {
    const state = runGoldenSeason({
      careerSeed: 2020,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      stopAt: "OFFSEASON_DONE",
    }).finalState;

    syncCurrentSave({ ...state, saveId: "corrupt-me" }, "corrupt-me");
    const canonicalBeforeCorruption = loadSaveResult("corrupt-me");
    expect(canonicalBeforeCorruption.ok).toBe(true);
    if (!canonicalBeforeCorruption.ok) throw new Error("expected canonical save before corruption");

    syncCurrentSave({ ...canonicalBeforeCorruption.state, saveId: "corrupt-me" }, "corrupt-me");

    const key = "hc_career_save__corrupt-me";
    localStorage.setItem(key, "{not valid json");

    const result = loadSaveResult("corrupt-me");
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(stableDeterminismHash(result.state)).toBe(stableDeterminismHash(canonicalBeforeCorruption.state));
      expect(stableIntegrityHash(result.state)).toBe(stableIntegrityHash(canonicalBeforeCorruption.state));
    } else {
      expect(result.code).toBe("CORRUPT_SAVE");
      expect(result.restoredFromBackup).toBe(false);
    }
  });
});
