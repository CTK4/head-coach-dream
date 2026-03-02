import { describe, expect, it } from "vitest";
import { computeDeadMoneyLedger } from "@/engine/deadMoney";
import type { GameState, Transaction } from "@/context/GameContext";

function makeMinimalState(overrides: Partial<GameState> = {}): GameState {
  return {
    season: 2026,
    saveSeed: 12345,
    finances: {
      cap: 250_000_000,
      carryover: 0,
      incentiveTrueUps: 0,
      deadCapThisYear: 0,
      deadCapNextYear: 0,
      baseCommitted: 0,
      capCommitted: 0,
      capSpace: 250_000_000,
      cash: 100_000_000,
      postJune1Sim: false,
    },
    transactions: [],
    ...overrides,
  } as unknown as GameState;
}

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "2026_P001_CUT",
    type: "CUT",
    playerId: "P001",
    playerName: "John Doe",
    playerPos: "QB",
    fromTeamId: "TEAM_A",
    season: 2026,
    june1Designation: "PRE_JUNE_1",
    deadCapThisYear: 10_000_000,
    deadCapNextYear: 0,
    remainingProration: 10_000_000,
    ...overrides,
  };
}

describe("computeDeadMoneyLedger", () => {
  it("returns empty ledger when no transactions", () => {
    const state = makeMinimalState();
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.playerCount).toBe(0);
    expect(ledger.totalDeadCapThisYear).toBe(0);
    expect(ledger.totalDeadCapNextYear).toBe(0);
    expect(ledger.entries).toHaveLength(0);
  });

  it("includes matching transaction", () => {
    const tx = makeTx();
    const state = makeMinimalState({ transactions: [tx] } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.playerCount).toBe(1);
    expect(ledger.totalDeadCapThisYear).toBe(10_000_000);
    expect(ledger.entries[0].playerName).toBe("John Doe");
    expect(ledger.entries[0].transactionType).toBe("CUT");
  });

  it("excludes transactions for other teams", () => {
    const tx = makeTx({ fromTeamId: "TEAM_B" });
    const state = makeMinimalState({ transactions: [tx] } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.playerCount).toBe(0);
  });

  it("excludes transactions from other seasons", () => {
    const tx = makeTx({ season: 2025 });
    const state = makeMinimalState({ transactions: [tx] } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.playerCount).toBe(0);
  });

  it("sums multiple entries correctly", () => {
    const tx1 = makeTx({ id: "2026_P001_CUT", playerId: "P001", deadCapThisYear: 8_000_000 });
    const tx2 = makeTx({ id: "2026_P002_CUT", playerId: "P002", deadCapThisYear: 5_000_000 });
    const state = makeMinimalState({ transactions: [tx1, tx2] } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.playerCount).toBe(2);
    expect(ledger.totalDeadCapThisYear).toBe(13_000_000);
  });

  it("sorts entries by deadCapThisYear descending", () => {
    const tx1 = makeTx({ id: "2026_P001_CUT", playerId: "P001", deadCapThisYear: 3_000_000 });
    const tx2 = makeTx({ id: "2026_P002_CUT", playerId: "P002", deadCapThisYear: 9_000_000 });
    const state = makeMinimalState({ transactions: [tx1, tx2] } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.entries[0].deadCapThisYear).toBe(9_000_000);
    expect(ledger.entries[1].deadCapThisYear).toBe(3_000_000);
  });

  it("computes capPct correctly", () => {
    const tx = makeTx({ deadCapThisYear: 25_000_000 });
    const state = makeMinimalState({
      transactions: [tx],
      finances: {
        cap: 250_000_000,
        carryover: 0,
        incentiveTrueUps: 0,
        deadCapThisYear: 0,
        deadCapNextYear: 0,
        baseCommitted: 0,
        capCommitted: 0,
        capSpace: 250_000_000,
        cash: 100_000_000,
        postJune1Sim: false,
      },
    } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.capPct).toBeCloseTo(0.1, 5);
  });

  it("handles Post–June 1 next-year dead cap", () => {
    const tx = makeTx({
      june1Designation: "POST_JUNE_1",
      deadCapThisYear: 5_000_000,
      deadCapNextYear: 5_000_000,
    });
    const state = makeMinimalState({ transactions: [tx] } as any);
    const ledger = computeDeadMoneyLedger(state, "TEAM_A", 2026);
    expect(ledger.totalDeadCapNextYear).toBe(5_000_000);
    expect(ledger.entries[0].accelerationType).toBe("POST_JUNE_1");
  });
});
