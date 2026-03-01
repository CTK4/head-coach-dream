import { describe, expect, it } from "vitest";
import { applyDraftPick, applyRookieSign } from "@/engine/transactions/transactionAPI";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

function mkState(): any {
  return { season: 2025, week: 1, rookies: [{ playerId: "rookie-1", teamId: "FREE_AGENT" }], playerTeamOverrides: {}, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], lastTxId: 0 } };
}

describe("draft assign", () => {
  it("assigns drafted player to drafting team", () => {
    const drafted = applyDraftPick(mkState(), "CHI", "rookie-1", { overall: 1 });
    const signed = applyRookieSign(drafted, "CHI", "rookie-1", { startSeason: 2025, endSeason: 2028, salaries: [1, 1, 1, 1], signingBonus: 0 });
    expect(buildRosterIndex(signed).playerToTeam["rookie-1"]).toBe("CHI");
  });
});
