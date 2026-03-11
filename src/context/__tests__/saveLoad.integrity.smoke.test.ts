import { describe, expect, it } from "vitest";
import type { GameState } from "@/context/GameContext";
import { getAvailableEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { createSaveManager } from "@/lib/saveManager";
import { runGoldenSeason } from "@/testHarness/goldenSeasonRunner";

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
}

function buildIntegritySnapshot(state: GameState, userTeamId: string) {
  return {
    rosterIndexKeys: Object.keys(state.rosterMgmt.active).sort(),
    firstRoundPickOwner: state.draft.leaguePicks.find((pick) => pick.round === 1)?.teamId ?? null,
    capSpace: state.finances.capSpace,
    availablePlayerIds: getAvailableEffectivePlayersByTeam(state, userTeamId)
      .map((p) => p.playerId)
      .sort(),
  };
}

describe("save/load integrity smoke", () => {
  it("preserves roster index, pick ownership, cap, and availability parity after roundtrip", () => {
    const prepared = runGoldenSeason({
      careerSeed: 2026,
      userTeamId: "MILWAUKEE_NORTHSHORE",
      strategy: { resignTopN: 3 },
      stopAt: "OFFSEASON_DONE",
    }).finalState;

    const userTeamId = String(prepared.userTeamId ?? prepared.acceptedOffer?.teamId ?? "");
    const before = buildIntegritySnapshot(prepared, userTeamId);

    const saveManager = createSaveManager({ storage: new LocalStorageMock() });
    const saveId = "save-load-integrity-smoke";
    saveManager.syncCurrentSave({ ...prepared, saveId }, saveId);

    const loaded = saveManager.loadSaveResult(saveId);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) throw new Error("load failed");

    const after = buildIntegritySnapshot(loaded.state, userTeamId);
    expect(after).toEqual(before);
  }, 120_000);
});
