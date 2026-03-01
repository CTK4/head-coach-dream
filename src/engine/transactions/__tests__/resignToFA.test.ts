import { describe, expect, it } from "vitest";
import { getPlayers } from "@/data/leagueDb";
import { applyCut } from "@/engine/transactions/transactionAPI";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

function mkState(): any {
  return { season: 2025, week: 1, rookies: [], playerTeamOverrides: {}, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], lastTxId: 0 } };
}

describe("resign to FA lifecycle", () => {
  it("unretained player can become FA", () => {
    const p = getPlayers().find((x) => String(x.teamId ?? "").toUpperCase() !== "FREE_AGENT")!;
    const next = applyCut(mkState(), String(p.teamId), String(p.playerId), "expiry");
    expect(buildRosterIndex(next).playerToTeam[String(p.playerId)]).toBe("FREE_AGENT");
  });
});
