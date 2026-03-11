import { describe, expect, it, vi } from "vitest";
import type { GameState } from "@/context/GameContext";
import { validatePostTx } from "@/engine/transactions/validatePostTx";

const contractsById: Record<string, any> = {
  c2: { startSeason: 2025, endSeason: 2025, salaries: [600_000], signingBonus: 0 },
  c4: { startSeason: 2025, endSeason: 2025, salaries: [700_000], signingBonus: 0 },
};

vi.mock("@/data/leagueDb", () => ({
  getPlayers: () => [
    { playerId: "p1", teamId: "A", contractId: "c1", status: "ACTIVE" },
    { playerId: "p2", teamId: "A", contractId: "c2", status: "ACTIVE" },
    { playerId: "p3", teamId: "FREE_AGENT", contractId: null, status: "FREE_AGENT" },
    { playerId: "p4", teamId: "A", contractId: "c4", status: "ACTIVE" },
  ],
  getContractById: (contractId: string) => contractsById[contractId],
  getLeague: () => ({ salaryCap: 1_500_000 }),
}));

describe("validatePostTx cap integration with DB-backed contracts", () => {
  it("returns ok=true when mixed override + DB-backed contracts are under cap", () => {
    const state = {
      season: 2025,
      week: 1,
      rookies: [],
      finances: { cap: 1_500_000 },
      playerTeamOverrides: { p1: "A", p2: "A", p3: "FREE_AGENT", p4: "FREE_AGENT" },
      playerContractOverrides: {
        p1: { startSeason: 2025, endSeason: 2025, salaries: [700_000], signingBonus: 0 },
      },
      transactionLedger: { events: [], counter: 0 },
    } as unknown as GameState;

    const result = validatePostTx(state);
    expect(result).toEqual({ ok: true });
  });

  it("fails with cap overage when DB-backed non-overridden contract pushes roster over cap", () => {
    const state = {
      season: 2025,
      week: 1,
      rookies: [],
      finances: { cap: 1_000_000 },
      playerTeamOverrides: { p1: "A", p2: "FREE_AGENT", p3: "FREE_AGENT", p4: "A" },
      playerContractOverrides: {
        p1: { startSeason: 2025, endSeason: 2025, salaries: [400_000], signingBonus: 0 },
      },
      transactionLedger: { events: [], counter: 0 },
    } as unknown as GameState;

    const result = validatePostTx(state);
    expect(result).toEqual({
      ok: false,
      errors: ["cap overage A: used=1100000 cap=1000000 delta=100000"],
    });
  });
});
