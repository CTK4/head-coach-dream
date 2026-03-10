import { describe, expect, it } from "vitest";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { Tx } from "@/engine/transactions/transactionAPI";

function mkState(): any {
  return { season: 2025, week: 1, rookies: [], playerTeamOverrides: { p1: "A" }, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], counter: 0 } };
}

describe("one year resign", () => {
  it("registers as new contract override", () => {
    const state = mkState();
    const tx = { ...Tx.resign("A", "p1", { startSeason: 2025, endSeason: 2025, salaries: [1_000_000], signingBonus: 0 }), txId: buildTxId(state), season: 2025, weekIndex: 1, ts: 20250101 } as any;
    const next = applyTransaction(state, tx);
    expect(next.playerContractOverrides.p1.endSeason).toBe(2025);
  });
});
