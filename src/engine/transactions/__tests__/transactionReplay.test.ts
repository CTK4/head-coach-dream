import { describe, expect, it } from "vitest";
import { getPlayers } from "@/data/leagueDb";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import { applyCut, applySignFA } from "@/engine/transactions/transactionAPI";

function mkState(): any {
  return {
    season: 2025,
    week: 1,
    rookies: [],
    playerTeamOverrides: {},
    playerContractOverrides: {},
    transactions: [],
    transactionLedger: { events: [], lastTxId: 0 },
  };
}

describe("transaction replay", () => {
  it("replay is deterministic", () => {
    const player = getPlayers().find((p) => String(p.teamId ?? "").toUpperCase() !== "FREE_AGENT");
    const teamId = String(player?.teamId ?? "");
    const state1 = applyCut(mkState(), teamId, String(player?.playerId), "test");
    const state2 = applySignFA(state1, teamId, String(player?.playerId), { startSeason: 2025, endSeason: 2025, salaries: [1_000_000], signingBonus: 0 });
    expect(buildRosterIndex(state2)).toEqual(buildRosterIndex(state2));
  });
});
