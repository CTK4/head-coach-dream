import { beforeEach, describe, expect, it } from "vitest";
import { loadSaveResult, syncCurrentSave } from "@/lib/saveManager";
import { runGoldenSeason } from "@/testHarness/goldenSeasonRunner";
import { stableStateHash } from "@/testHarness/stateHash";

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
    const offseason = runGoldenSeason({ careerSeed: 1001, userTeamId: "MILWAUKEE_NORTHSHORE", strategy: { resignTopN: 3 } }).finalState;

    const offseasonLoaded = saveAndLoad("golden-offseason", offseason);
    const offseasonLoadedAgain = saveAndLoad("golden-offseason-2", offseasonLoaded);
    expect(stableStateHash(offseasonLoadedAgain)).toBe(stableStateHash(offseasonLoaded));
    expect(offseasonLoaded.careerStage).toBe(offseason.careerStage);

    const midseason = {
      ...offseason,
      careerStage: "REGULAR_SEASON",
      hub: { ...offseason.hub, regularSeasonWeek: 9 },
      week: 9,
      league: { ...offseason.league, week: 9 },
    };
    const midLoaded = saveAndLoad("golden-midseason", midseason);
    const midLoadedAgain = saveAndLoad("golden-midseason-2", midLoaded);
    expect(stableStateHash(midLoadedAgain)).toBe(stableStateHash(midLoaded));
    expect(midLoaded.hub.regularSeasonWeek).toBe(9);

    const postseason = { ...offseason, careerStage: "SEASON_AWARDS" };
    const postLoaded = saveAndLoad("golden-postseason", postseason);
    const postLoadedAgain = saveAndLoad("golden-postseason-2", postLoaded);
    expect(stableStateHash(postLoadedAgain)).toBe(stableStateHash(postLoaded));
    expect(postLoaded.careerStage).toBe("SEASON_AWARDS");
  });
});
