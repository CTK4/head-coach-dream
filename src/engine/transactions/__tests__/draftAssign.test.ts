import { describe, expect, it } from "vitest";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { Tx } from "@/engine/transactions/transactionAPI";

describe("draft assign", () => {
  it("draft + rookie sign places player on team", () => {
    let state: any = { season: 2025, week: 1, rookies: [], playerTeamOverrides: {}, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], counter: 0 } };
    state = applyTransaction(state, { ...Tx.draftPick("CHI", "rookie-1", { overall: 1 }), txId: buildTxId(state), season: 2025, weekIndex: 1, ts: 1 } as any);
    state = applyTransaction(state, { ...Tx.rookieSign("CHI", "rookie-1", { startSeason: 2025, endSeason: 2028, salaries: [1, 1, 1, 1], signingBonus: 0 }), txId: buildTxId(state), season: 2025, weekIndex: 1, ts: 2 } as any);
    expect(state.playerTeamOverrides["rookie-1"]).toBe("CHI");
  });
});
