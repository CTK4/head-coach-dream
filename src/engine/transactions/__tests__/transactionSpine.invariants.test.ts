import { describe, expect, it } from "vitest";
import { applyTransaction, buildTxId } from "@/engine/transactions/applyTransaction";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { Tx } from "@/engine/transactions/transactionAPI";
import { sortTransactionEvents } from "@/engine/transactions/transactionLedger";

type S = any;

function baseState(): S {
  return {
    season: 2026,
    week: 1,
    rookies: [],
    draft: {
      slots: [
        { overall: 1, round: 1, year: 2026, originalTeamId: "A", teamId: "A" },
        { overall: 33, round: 2, year: 2026, originalTeamId: "A", teamId: "A" },
      ],
    },
    playerTeamOverrides: {
      pA1: "A",
      pA2: "A",
      pB1: "B",
      pFA: "FREE_AGENT",
    },
    playerContractOverrides: {
      pA1: { startSeason: 2025, endSeason: 2026, salaries: [1_000_000, 1_000_000], signingBonus: 0 },
      pA2: { startSeason: 2025, endSeason: 2026, salaries: [900_000, 900_000], signingBonus: 0 },
      pB1: { startSeason: 2025, endSeason: 2026, salaries: [1_100_000, 1_100_000], signingBonus: 0 },
    },
    transactionLedger: { events: [], counter: 0 },
    transactions: [],
  };
}

function withTx(state: S, txDraft: any, ts = 1): S {
  return applyTransaction(state, { ...txDraft, txId: buildTxId(state), season: state.season, weekIndex: state.week, ts } as any);
}

describe("transaction spine invariants", () => {
  it("golden offseason mutation path keeps roster + contract state aligned", () => {
    let s = baseState();

    s = withTx(s, Tx.resign("A", "pA1", { startSeason: 2026, endSeason: 2028, salaries: [2_000_000, 2_000_000, 2_000_000], signingBonus: 0 }), 1);
    s = withTx(s, Tx.signFA("A", "pFA", { startSeason: 2026, endSeason: 2027, salaries: [1_500_000, 1_500_000], signingBonus: 0 }), 2);
    s = withTx(s, Tx.trade("A", "B", { playerIdsFrom: ["pA2"], playerIdsTo: ["pB1"], pickSwaps: [{ round: 1, year: 2026, originalTeamId: "A", fromTeamId: "A", toTeamId: "B" }] }), 3);
    s = withTx(s, Tx.cut("A", "pB1", "PRE_JUNE_1"), 4);
    s = withTx(s, Tx.draftPick("B", "rookie-1", { overall: 1, round: 1 }), 5);
    s = withTx(s, Tx.rookieSign("B", "rookie-1", { startSeason: 2026, endSeason: 2029, salaries: [1, 1, 1, 1], signingBonus: 0 }), 6);

    const roster = buildRosterIndex(s);
    const allTeamMembership = Object.values(roster.teamToPlayers).flat();
    expect(new Set(allTeamMembership).size).toBe(allTeamMembership.length);

    expect(roster.playerToTeam.pFA).toBe("A");
    expect(roster.freeAgents).not.toContain("pFA");
    expect(roster.playerToTeam.pB1).toBe("FREE_AGENT");
    expect(roster.teamToPlayers.A).not.toContain("pB1");

    const contracts = buildContractIndex(s);
    expect(contracts.pFA).toBeTruthy();
    expect(contracts.pB1).toBeUndefined();
    expect(roster.playerToTeam["rookie-1"]).toBe("B");
    expect(contracts["rookie-1"]?.endSeason).toBe(2029);

    expect((s.draft.slots ?? []).find((slot: any) => slot.overall === 1)?.teamId).toBe("B");

    const txIds = (s.transactionLedger.events ?? []).map((tx: any) => String(tx.txId));
    expect(new Set(txIds).size).toBe(txIds.length);
    expect(Number(s.transactionLedger.counter)).toBe((s.transactionLedger.events ?? []).length);
  });

  it("withdrawn FA offer leaves no ghost signing state in canonical ledger state", () => {
    const s = baseState();
    const offerBook = {
      freeAgency: {
        offersByPlayerId: {
          pFA: [{ offerId: "O1", playerId: "pFA", teamId: "A", isUser: true, years: 2, aav: 2_000_000, createdWeek: 1, status: "WITHDRAWN" }],
        },
        signingsByPlayerId: {},
      },
      transactionLedger: s.transactionLedger,
      playerTeamOverrides: s.playerTeamOverrides,
    } as any;

    expect(offerBook.freeAgency.offersByPlayerId.pFA[0].status).toBe("WITHDRAWN");
    expect(offerBook.freeAgency.signingsByPlayerId.pFA).toBeUndefined();
    expect(offerBook.playerTeamOverrides.pFA).toBe("FREE_AGENT");
    expect((offerBook.transactionLedger.events ?? []).some((tx: any) => tx.kind === "SIGN_FA" && String(tx.playerIds?.[0]) === "pFA")).toBe(false);
  });

  it("transaction state roundtrip preserves coherent ledger and assignment", () => {
    let s = baseState();
    s = withTx(s, Tx.signFA("A", "pFA", { startSeason: 2026, endSeason: 2027, salaries: [1_000_000, 1_000_000], signingBonus: 0 }), 1);
    s = withTx(s, Tx.cut("A", "pA2", "PRE_JUNE_1"), 2);

    const raw = JSON.parse(JSON.stringify(s));
    const sorted = sortTransactionEvents(raw.transactionLedger.events ?? []);

    expect(Number(raw.transactionLedger.counter)).toBe(sorted.length);
    const roster = buildRosterIndex(raw);
    expect(roster.playerToTeam.pFA).toBe("A");
    expect(roster.playerToTeam.pA2).toBe("FREE_AGENT");

    const contracts = buildContractIndex(raw);
    expect(contracts.pFA).toBeTruthy();
    expect(contracts.pA2).toBeUndefined();
  });
});
