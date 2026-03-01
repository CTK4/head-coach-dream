import { describe, expect, it } from "vitest";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { Tx } from "@/engine/transactions/transactionAPI";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

function withTx(state: any, draft: any) {
  return applyTransaction(state, { ...draft, txId: buildTxId(state), season: state.season, weekIndex: state.week, ts: state.season * 10_000 + state.week * 100 + state.transactionLedger.counter + 1 });
}

describe("transaction replay", () => {
  it("is deterministic across replays", () => {
    let s: any = { season: 2025, week: 1, rookies: [], playerTeamOverrides: { p1: "A", p2: "B" }, playerContractOverrides: {}, transactions: [], transactionLedger: { events: [], counter: 0 } };
    s = withTx(s, Tx.trade("A", "B", { playerIdsFrom: ["p1"], playerIdsTo: ["p2"] }));
    s = withTx(s, Tx.cut("A", "p2", "test"));
    expect(buildRosterIndex(s)).toEqual(buildRosterIndex(s));
  });
});
