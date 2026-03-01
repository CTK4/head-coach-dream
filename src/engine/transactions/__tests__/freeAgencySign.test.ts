import { describe, expect, it } from "vitest";
import { getPlayers } from "@/data/leagueDb";
import { applyCut, applySignFA } from "@/engine/transactions/transactionAPI";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

function mkState(): any {
  return { season: 2025, week: 1, rookies: [], playerTeamOverrides: {}, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], lastTxId: 0 } };
}

describe("FA signing", () => {
  it("moves FA to team", () => {
    const p = getPlayers().find((x) => String(x.teamId ?? "").toUpperCase() !== "FREE_AGENT")!;
    const cut = applyCut(mkState(), String(p.teamId), String(p.playerId), "make FA");
    const signed = applySignFA(cut, String(p.teamId), String(p.playerId), { startSeason: 2025, endSeason: 2026, salaries: [1_000_000, 1_000_000], signingBonus: 0 });
    expect(buildRosterIndex(signed).playerToTeam[String(p.playerId)]).toBe(String(p.teamId));
  });
});
