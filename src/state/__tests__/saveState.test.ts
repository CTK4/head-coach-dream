import { describe, expect, it } from "vitest";

import { applyTx, computeTeamSchemeFit, createNewSave, getEffectiveRoster, replayTransactions, validatePostTx } from "@/state/saveState";

describe("createNewSave", () => {
  it("builds deterministic worlds from seed", () => {
    const a = createNewSave({ seed: "alpha", userTeamId: "ATLANTA_APEX" });
    const b = createNewSave({ seed: "alpha", userTeamId: "ATLANTA_APEX" });
    expect(a.league.schedule).toEqual(b.league.schedule);
    expect(a.coaches.marketCoachIds).toEqual(b.coaches.marketCoachIds);
  });

  it("applies/replays tx ledger for FA signing", () => {
    const state = createNewSave({ seed: 5, userTeamId: "ATLANTA_APEX" });
    const freeAgent = Object.values(state.roster.playersById).find((player) => state.roster.assignments[player.id] === "FA");
    if (!freeAgent) throw new Error("Expected at least one free agent in fixture.");

    const txState = applyTx(state, {
      id: "tx-1",
      type: "SIGN_FA",
      createdAt: "1970-01-01T00:00:00.000Z",
      teamId: "ATLANTA_APEX",
      playerId: freeAgent.id,
      contract: { startSeason: 2026, endSeason: 2028, apy: 5_000_000, guaranteed: 8_000_000 },
    });

    expect(getEffectiveRoster(txState, "ATLANTA_APEX").some((p) => p.id === freeAgent.id)).toBe(true);
    expect(txState.contracts.capTable.ATLANTA_APEX).toBeGreaterThan(0);

    const replayed = replayTransactions(state, txState.transactions);
    expect(replayed.roster.assignments[freeAgent.id]).toBe("ATLANTA_APEX");
  });

  it("provides scheme fit + post-tx validation hooks", () => {
    const state = createNewSave({ seed: 9, userTeamId: "ATLANTA_APEX" });
    const fit = computeTeamSchemeFit(state, "ATLANTA_APEX");
    expect(fit).toBeGreaterThanOrEqual(0);
    expect(fit).toBeLessThanOrEqual(100);
    expect(validatePostTx(state)).toEqual([]);
  });
});
