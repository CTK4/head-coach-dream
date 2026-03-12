import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock leagueDb before importing contractMath so the module-level getPlayerById call is safe.
vi.mock("@/data/leagueDb", () => ({
  getPlayerById: vi.fn(() => ({ age: 28 })),
}));

// getContractSummaryForPlayer is only used by computeCutProjection / computeDeadCap / getContract
// which depend on the full GameState + rosterOverlay. We test only the pure contract-math paths
// that operate on playerContractOverrides directly.
vi.mock("@/engine/rosterOverlay", () => ({
  getContractSummaryForPlayer: vi.fn(() => null),
}));

import {
  buildCapTable,
  simulateRestructure,
  maxRestructureAmount,
  getRestructureEligibility,
  computeCutProjection,
} from "@/engine/contractMath";
import { getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import type { GameState, PlayerContractOverride } from "@/context/GameContext";

const SEASON = 2026;

function makeOverride(overrides: Partial<PlayerContractOverride> = {}): PlayerContractOverride {
  return {
    startSeason: SEASON,
    endSeason: SEASON + 2,
    salaries: [5_000_000, 6_000_000, 7_000_000],
    signingBonus: 3_000_000,
    prorationBySeason: {},
    ...overrides,
  } as PlayerContractOverride;
}

function makeState(pId: string, override?: PlayerContractOverride): GameState {
  return {
    season: SEASON,
    playerContractOverrides: override ? { [pId]: override } : {},
  } as unknown as GameState;
}

beforeEach(() => {
  vi.mocked(getContractSummaryForPlayer).mockReset();
});

// ---------------------------------------------------------------------------
// buildCapTable
// ---------------------------------------------------------------------------
describe("buildCapTable", () => {
  it("returns empty rows when player has no contract override", () => {
    const state = makeState("P001");
    const table = buildCapTable(state, "P001");
    expect(table.rows).toHaveLength(0);
    expect(table.total5y).toBe(0);
  });

  it("builds correct rows with signing bonus proration", () => {
    // signingBonus=3M, 3-year contract → fallback proration = 1M/year
    const override = makeOverride({ prorationBySeason: {} });
    const state = makeState("P001", override);
    const table = buildCapTable(state, "P001", 3);

    expect(table.rows).toHaveLength(3);
    // Year 0: salary=5M + proration=1M = 6M
    expect(table.rows[0].salary).toBe(5_000_000);
    expect(table.rows[0].bonus).toBe(1_000_000);
    expect(table.rows[0].capHit).toBe(6_000_000);
    // Total should be sum of all cap hits
    const total = table.rows.reduce((a, r) => a + r.capHit, 0);
    expect(table.total5y).toBe(total);
  });

  it("rounds all monetary values to nearest 50k", () => {
    const override = makeOverride({ salaries: [5_025_000, 6_025_000, 7_025_000] });
    const state = makeState("P001", override);
    const table = buildCapTable(state, "P001", 3);
    for (const row of table.rows) {
      expect(row.salary % 50_000).toBe(0);
      expect(row.capHit % 50_000).toBe(0);
    }
  });

  it("uses prorationBySeason when provided, not fallback", () => {
    const prorationBySeason: Record<number, number> = {
      [SEASON]: 2_000_000,
      [SEASON + 1]: 2_000_000,
      [SEASON + 2]: 2_000_000,
    };
    const override = makeOverride({ prorationBySeason, signingBonus: 9_000_000 });
    const state = makeState("P001", override);
    const table = buildCapTable(state, "P001", 3);
    // Per-season proration (2M) should be used, not fallback (3M)
    expect(table.rows[0].bonus).toBe(2_000_000);
  });
});

// ---------------------------------------------------------------------------
// maxRestructureAmount
// ---------------------------------------------------------------------------
describe("maxRestructureAmount", () => {
  it("returns 0 when player has no contract override", () => {
    const state = makeState("P001");
    expect(maxRestructureAmount(state, "P001")).toBe(0);
  });

  it("returns the current-year salary rounded to 50k", () => {
    const override = makeOverride({ salaries: [8_750_000, 9_000_000, 9_000_000] });
    const state = makeState("P001", override);
    expect(maxRestructureAmount(state, "P001")).toBe(8_750_000);
  });
});

// ---------------------------------------------------------------------------
// simulateRestructure
// ---------------------------------------------------------------------------
describe("simulateRestructure", () => {
  it("returns unmodified table when player has no contract", () => {
    const state = makeState("P001");
    const result = simulateRestructure(state, "P001", 1_000_000);
    expect(result.rows).toHaveLength(0);
  });

  it("reduces current-year salary by restructured amount", () => {
    const override = makeOverride({ prorationBySeason: {} });
    const state = makeState("P001", override);
    const restructureAmt = 2_000_000;

    const before = buildCapTable(state, "P001", 3);
    const after = simulateRestructure(state, "P001", restructureAmt, 3);

    // Year 0 base salary should be 2M lower
    expect(after.rows[0].salary).toBe(before.rows[0].salary - restructureAmt);
  });

  it("spreads restructured amount as added proration across all remaining years", () => {
    const override = makeOverride({ prorationBySeason: {}, signingBonus: 0 });
    const state = makeState("P001", override);
    const restructureAmt = 3_000_000; // 3M across 3 remaining years = 1M/year

    const before = buildCapTable(state, "P001", 3);
    const after = simulateRestructure(state, "P001", restructureAmt, 3);

    // Each year should have 1M more proration
    const yearsLeft = 3;
    const addedPerYear = Math.round(restructureAmt / yearsLeft / 50_000) * 50_000;
    for (let i = 0; i < yearsLeft; i++) {
      expect(after.rows[i].bonus).toBe(before.rows[i].bonus + addedPerYear);
    }
  });

  it("preserves total cap hit (restructure defers, not reduces)", () => {
    const override = makeOverride({ prorationBySeason: {}, signingBonus: 0 });
    const state = makeState("P001", override);

    const before = buildCapTable(state, "P001", 3);
    const after = simulateRestructure(state, "P001", 1_500_000, 3);

    // Total cap hit stays the same within the contract window
    expect(after.total5y).toBe(before.total5y);
  });

  it("clamps restructure amount to [0, currentSalary]", () => {
    const override = makeOverride({ salaries: [5_000_000, 6_000_000, 7_000_000], prorationBySeason: {} });
    const state = makeState("P001", override);

    // Amount larger than salary → clamp to salary
    const result = simulateRestructure(state, "P001", 999_000_000, 3);
    // Year-0 salary after clamping should be 0 (entire salary converted)
    expect(result.rows[0].salary).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getRestructureEligibility
// ---------------------------------------------------------------------------
describe("getRestructureEligibility", () => {
  it("returns ineligible when player has no contract override", () => {
    const state = makeState("P001");
    const result = getRestructureEligibility(state, "P001");
    expect(result.eligible).toBe(false);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it("returns ineligible when fewer than 2 years remain", () => {
    // 1-year contract: startSeason=endSeason=2026
    const override = makeOverride({ startSeason: SEASON, endSeason: SEASON, salaries: [5_000_000] });
    const state = makeState("P001", override);
    const result = getRestructureEligibility(state, "P001");
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("2 years"))).toBe(true);
  });

  it("returns ineligible when current salary is 0", () => {
    const override = makeOverride({ salaries: [0, 0, 0] });
    const state = makeState("P001", override);
    const result = getRestructureEligibility(state, "P001");
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("base salary"))).toBe(true);
  });

  it("returns eligible for a typical multi-year veteran contract", () => {
    // 3-year contract starting this year, decent salary → should be eligible
    const override = makeOverride({
      startSeason: SEASON,
      endSeason: SEASON + 2,
      salaries: [8_000_000, 9_000_000, 10_000_000],
    });
    const state = makeState("P001", override);
    const result = getRestructureEligibility(state, "P001");
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// computeCutProjection
// ---------------------------------------------------------------------------
describe("computeCutProjection", () => {
  it("pre-June 1 cut: all dead cap charges in current year, none next year", () => {
    vi.mocked(getContractSummaryForPlayer).mockReturnValue({
      capHitBySeason: { [SEASON]: 10_000_000 },
      deadCapIfCutNow: 6_000_000,
    } as any);

    const state = makeState("P001");
    const proj = computeCutProjection(state, "P001", false);
    expect(proj.deadThisYear).toBe(6_000_000);
    expect(proj.deadNextYear).toBe(0);
    expect(proj.savingsThisYear).toBe(4_000_000); // 10M - 6M
  });

  it("post-June 1 cut: dead cap splits 50/50 across this year and next", () => {
    vi.mocked(getContractSummaryForPlayer).mockReturnValue({
      capHitBySeason: { [SEASON]: 10_000_000 },
      deadCapIfCutNow: 6_000_000,
    } as any);

    const state = makeState("P001");
    const proj = computeCutProjection(state, "P001", true);
    expect(proj.deadThisYear).toBe(3_000_000);
    expect(proj.deadNextYear).toBe(3_000_000);
  });

  it("cut with no remaining dead cap yields full cap-space savings", () => {
    vi.mocked(getContractSummaryForPlayer).mockReturnValue({
      capHitBySeason: { [SEASON]: 5_000_000 },
      deadCapIfCutNow: 0,
    } as any);

    const state = makeState("P001");
    const proj = computeCutProjection(state, "P001", false);
    expect(proj.deadThisYear).toBe(0);
    expect(proj.savingsThisYear).toBe(5_000_000);
  });
});
