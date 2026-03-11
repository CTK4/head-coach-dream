import { describe, expect, it, vi } from "vitest";
import type { GameState } from "@/context/GameContext";
import { applyCanonicalTx } from "@/context/controllers/transactions";
import { Tx } from "@/engine/transactions/transactionAPI";

vi.mock("@/data/leagueDb", () => ({
  getPlayers: () => [
    { playerId: "p1", teamId: "A", status: "ACTIVE", contractId: null },
    { playerId: "p2", teamId: "FREE_AGENT", status: "FREE_AGENT", contractId: null },
  ],
  getContractById: () => undefined,
  getLeague: () => ({ salaryCap: 10_000_000 }),
}));

describe("applyCanonicalTx cap recovery", () => {
  const baseState = {
    season: 2025,
    week: 1,
    rookies: [],
    finances: { cap: 10_000_000 },
    playerAttrOverrides: {},
    playerTeamOverrides: { p1: "A", p2: "FREE_AGENT" },
    playerContractOverrides: {
      p1: { startSeason: 2025, endSeason: 2025, salaries: [9_950_000], signingBonus: 0 },
    },
    transactionLedger: { events: [], counter: 0 },
  } as unknown as GameState;

  it("auto-remediates minor overage by releasing the smallest cap contract", () => {
    const next = applyCanonicalTx(baseState, Tx.signFA("A", "p2", { startSeason: 2025, endSeason: 2025, salaries: [100_000], signingBonus: 0 }));

    expect(next.playerTeamOverrides.p2).toBe("FREE_AGENT");
    expect(next.playerContractOverrides.p2).toBeUndefined();
    expect(next.transactionLedger.counter).toBe(2);
    expect(next.recoveryNeeded ?? false).toBe(false);
  });

  it("marks state recoverable when overage is at least 1%", () => {
    const next = applyCanonicalTx(baseState, Tx.signFA("A", "p2", { startSeason: 2025, endSeason: 2025, salaries: [200_000], signingBonus: 0 }));

    expect(next.recoveryNeeded).toBe(true);
    expect(next.recoveryErrors?.[0]).toContain("Recovery Mode");
    expect(next.uiToast).toContain("Recovery Mode");
  });

  it("retains hard-block behavior for integrity errors", () => {
    const invalidState = {
      ...baseState,
      playerContractOverrides: {
        p1: { startSeason: 2026, endSeason: 2025, salaries: [9_950_000], signingBonus: 0 },
      },
    } as unknown as GameState;

    expect(() => applyCanonicalTx(invalidState, Tx.draftPick("A", "p1", {}))).toThrowError(/tx_validation_failed/);
  });
});
