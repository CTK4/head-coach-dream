import { beforeEach, describe, expect, it } from "vitest";
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

function saveAndLoad(saveId: string, state: any) {
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

  it("preserves state hash at offseason, midseason, and postseason checkpoints", () => {
    const offseason = runGoldenSeason({
      careerSeed: 1001,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      stopAt: "OFFSEASON_DONE",
    }).finalState;

    const offseasonLoaded = saveAndLoad("golden-offseason", offseason);
    const offseasonLoadedAgain = saveAndLoad("golden-offseason-2", offseasonLoaded);
    expect(stableDeterminismHash(offseasonLoaded)).toBe(stableDeterminismHash(offseason));
    expect(stableIntegrityHash(offseasonLoadedAgain)).toBe(stableIntegrityHash(offseasonLoaded));
    expect(offseasonLoaded.careerStage).toBe(offseason.careerStage);

    const midseason = runGoldenSeason({
      careerSeed: 1001,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      stopAt: "WEEK_9",
    }).finalState;
    const midLoaded = saveAndLoad("golden-midseason", midseason);
    const midLoadedAgain = saveAndLoad("golden-midseason-2", midLoaded);
    expect(stableDeterminismHash(midLoaded)).toBe(stableDeterminismHash(midseason));
    expect(stableIntegrityHash(midLoadedAgain)).toBe(stableIntegrityHash(midLoaded));
    expect(Number(midLoaded.weeklyResults?.length ?? 0)).toBeGreaterThanOrEqual(9);

    const postseason = runGoldenSeason({
      careerSeed: 1001,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      stopAt: "POSTSEASON",
    }).finalState;
    const postLoaded = saveAndLoad("golden-postseason", postseason);
    const postLoadedAgain = saveAndLoad("golden-postseason-2", postLoaded);
    expect(stableDeterminismHash(postLoaded)).toBe(stableDeterminismHash(postseason));
    expect(stableIntegrityHash(postLoadedAgain)).toBe(stableIntegrityHash(postLoaded));
    expect(postLoaded.careerStage).toBe("SEASON_AWARDS");
  });

  it("restores from backup when primary save is corrupted", () => {
    const s = runGoldenSeason({
      careerSeed: 2020,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      stopAt: "OFFSEASON_DONE",
    }).finalState;

    syncCurrentSave({ ...s, saveId: "corrupt-me" }, "corrupt-me");
    syncCurrentSave({ ...s, week: Number(s.week ?? 1) + 1, saveId: "corrupt-me" }, "corrupt-me");

    const key = "hc_career_save__corrupt-me";
    localStorage.setItem(key, "{not valid json");

    const res = loadSaveResult("corrupt-me");
    expect(res.ok).toBe(true);
    if (!res.ok) throw new Error("expected backup restore");
    const canonical = saveAndLoad("corrupt-me-canonical", res.state);
    expect(stableDeterminismHash(res.state)).toBe(stableDeterminismHash(s));
    expect(stableIntegrityHash(canonical)).toBe(stableIntegrityHash(res.state));
  });
});
