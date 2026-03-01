import { describe, expect, it } from "vitest";
import { getPlayers } from "@/data/leagueDb";
import { applyTrade } from "@/engine/transactions/transactionAPI";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

function mkState(): any {
  return { season: 2025, week: 1, rookies: [], playerTeamOverrides: {}, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], lastTxId: 0 } };
}

describe("trade move", () => {
  it("moves player across teams", () => {
    const players = getPlayers().filter((x) => String(x.teamId ?? "").toUpperCase() !== "FREE_AGENT");
    const a = players[0]!;
    const bTeam = String(players.find((x) => String(x.teamId) !== String(a.teamId))?.teamId ?? "");
    const next = applyTrade(mkState(), { fromTeamId: String(a.teamId), toTeamId: bTeam, playerIdsFrom: [String(a.playerId)], playerIdsTo: [] });
    expect(buildRosterIndex(next).playerToTeam[String(a.playerId)]).toBe(bTeam);
  });
});
