import { describe, expect, it, vi } from "vitest";
import type { GameState } from "@/context/GameContext";
import { validatePostTx } from "@/engine/transactions/validatePostTx";

vi.mock("@/data/leagueDb", () => ({
  getPlayers: () => [
    { playerId: "p1", teamId: "A", contractId: null },
    { playerId: "p2", teamId: "B", contractId: null },
  ],
  getContractById: () => undefined,
  getLeague: () => ({ salaryCap: 1_500_000 }),
}));

describe("validatePostTx cap checks", () => {
  it("adds deterministic cap overage errors for teams over the ceiling", () => {
    const state = {
      season: 2025,
      week: 1,
      rookies: [],
      finances: { cap: 1_000_000 },
      playerTeamOverrides: { p1: "A", p2: "B" },
      playerContractOverrides: {
        p1: { startSeason: 2025, endSeason: 2025, salaries: [1_200_000], signingBonus: 0 },
        p2: { startSeason: 2025, endSeason: 2025, salaries: [900_000], signingBonus: 0 },
      },
      transactionLedger: { events: [], counter: 0 },
    } as unknown as GameState;

    const result = validatePostTx(state);
    expect(result).toEqual({
      ok: false,
      errors: ["cap overage A: used=1200000 cap=1000000 delta=200000"],
    });
  });

  it("falls back to league default cap when state.finances.cap is missing", () => {
    const state = {
      season: 2025,
      week: 1,
      rookies: [],
      finances: {},
      playerTeamOverrides: { p1: "A", p2: "FREE_AGENT" },
      playerContractOverrides: {
        p1: { startSeason: 2025, endSeason: 2026, salaries: [1_600_000, 1_000_000], signingBonus: 200_000 },
      },
      transactionLedger: { events: [], counter: 0 },
    } as unknown as GameState;

    const result = validatePostTx(state);
    expect(result).toEqual({
      ok: false,
      errors: ["cap overage A: used=1700000 cap=1500000 delta=200000"],
    });
  });

  it("emits validation error when a rostered active player is missing a contract mapping", () => {
    const state = {
      season: 2025,
      week: 1,
      rookies: [],
      finances: { cap: 10_000_000 },
      playerTeamOverrides: { p1: "A", p2: "FREE_AGENT" },
      playerContractOverrides: {},
      transactionLedger: { events: [], counter: 0 },
    } as unknown as GameState;

    const result = validatePostTx(state);
    expect(result).toEqual({
      ok: false,
      errors: ["missing active contract mapping p1: team=A"],
    });
  });
});
