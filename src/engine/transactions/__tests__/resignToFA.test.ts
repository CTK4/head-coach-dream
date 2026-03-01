import { describe, expect, it } from "vitest";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { Tx } from "@/engine/transactions/transactionAPI";

describe("resignToFA", () => {
  it("release moves player to FA", () => {
    const state: any = { season: 2025, week: 1, rookies: [], playerTeamOverrides: { p1: "A" }, playerContractOverrides: { p1: { startSeason: 2024, endSeason: 2024, salaries: [1], signingBonus: 0 } }, transactions: [], transactionLedger: { events: [], counter: 0 } };
    const tx: any = { ...Tx.release("A", "p1", "CONTRACT_EXPIRED"), txId: buildTxId(state), season: 2025, weekIndex: 1, ts: 1 };
    const next = applyTransaction(state, tx);
    expect(next.playerTeamOverrides.p1).toBe("FREE_AGENT");
  });
});
