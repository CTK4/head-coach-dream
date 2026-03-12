import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/data/leagueDb", () => ({
  getLeague: vi.fn(() => ({ salaryCap: 200_000_000 })),
}));

vi.mock("@/engine/rosterOverlay", () => ({
  getEffectivePlayersByTeam: vi.fn(() => []),
  getContractSummaryForPlayer: vi.fn(() => null),
}));

import { computeCapLedger, computeCapLedgerV2 } from "@/engine/capLedger";
import { getEffectivePlayersByTeam, getContractSummaryForPlayer } from "@/engine/rosterOverlay";
import type { GameState } from "@/context/GameContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(overrides: Record<string, unknown> = {}): GameState {
  return {
    season: 2026,
    finances: {
      cap: 200_000_000,
      capSpace: 0,
      carryover: 0,
      incentiveTrueUps: 0,
      deadCapThisYear: 0,
      deadCapNextYear: 0,
      postJune1Sim: false,
    },
    offseasonData: { rosterAudit: { cutDesignations: {} } },
    ...overrides,
  } as unknown as GameState;
}

function makePlayer(id: string, overrides: Record<string, unknown> = {}) {
  return { playerId: id, fullName: `Player ${id}`, pos: "WR", ...overrides };
}

function makeContractSummary(capHit: number, yearsRemaining = 2) {
  return { capHit, yearsRemaining, capHitBySeason: { 2026: capHit } };
}

beforeEach(() => {
  vi.mocked(getEffectivePlayersByTeam).mockReturnValue([]);
  vi.mocked(getContractSummaryForPlayer).mockReturnValue(null);
});

// ---------------------------------------------------------------------------
// computeCapLedger
// ---------------------------------------------------------------------------

describe("computeCapLedger", () => {
  it("returns full cap as capSpace with empty roster", () => {
    const state = makeState();
    const result = computeCapLedger(state, "BEARS");
    expect(result.capSpace).toBe(200_000_000);
    expect(result.committed).toBe(0);
  });

  it("deducts a single player cap hit from available space", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([makePlayer("P001")] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(10_000_000) as any);

    const state = makeState();
    const result = computeCapLedger(state, "BEARS");
    expect(result.committed).toBe(10_000_000);
    expect(result.capSpace).toBe(190_000_000);
  });

  it("uses top-51 rule when useTop51 is true with 53 players", () => {
    const players = Array.from({ length: 53 }, (_, i) => makePlayer(`P${i}`, { overall: i }));
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue(players as any);
    // Each player: 1M cap hit
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(1_000_000) as any);

    const state = makeState();
    const allResult = computeCapLedger(state, "BEARS", { useTop51: false });
    const top51Result = computeCapLedger(state, "BEARS", { useTop51: true });

    expect(allResult.committed).toBe(53_000_000);
    expect(top51Result.committed).toBe(51_000_000);
  });

  it("uses capOverride when provided, ignoring state.finances.cap", () => {
    const state = makeState({ finances: { cap: 200_000_000, capSpace: 0, carryover: 0, incentiveTrueUps: 0, deadCapThisYear: 0, deadCapNextYear: 0, postJune1Sim: false } });
    const result = computeCapLedger(state, "BEARS", { capOverride: 120_000_000 });
    expect(result.cap).toBe(120_000_000);
  });

  it("uses state.finances.cap over LEAGUE_CAP_DEFAULT fallback", () => {
    const state = makeState();
    (state as any).finances.cap = 175_000_000;
    const result = computeCapLedger(state, "BEARS");
    expect(result.cap).toBe(175_000_000);
  });

  it("returns negative capSpace (over cap) without crashing", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([makePlayer("P001")] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(250_000_000) as any);

    const state = makeState();
    const result = computeCapLedger(state, "BEARS");
    expect(result.capSpace).toBeLessThan(0);
  });

  it("counts player with no contract summary as 0 cap hit (no crash)", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([makePlayer("P001")] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(null);

    const state = makeState();
    expect(() => computeCapLedger(state, "BEARS")).not.toThrow();
    const result = computeCapLedger(state, "BEARS");
    expect(result.committed).toBe(0);
  });

  it("rounds all monetary values to nearest 50k", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([makePlayer("P001")] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(10_025_000) as any);

    const state = makeState();
    const result = computeCapLedger(state, "BEARS");
    expect(result.committed % 50_000).toBe(0);
    expect(result.capSpace % 50_000).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeCapLedgerV2
// ---------------------------------------------------------------------------

describe("computeCapLedgerV2", () => {
  it("lines start with LEAGUE_CAP and end with AVAILABLE_CAP", () => {
    const state = makeState();
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.lines[0].id).toBe("LEAGUE_CAP");
    expect(result.lines[result.lines.length - 1].id).toBe("AVAILABLE_CAP");
  });

  it("ADJUSTED_CAP = LEAGUE_CAP + CARRYOVER + INCENTIVE_TRUE_UPS - DEAD_CAP", () => {
    const state = makeState();
    (state as any).finances.cap = 200_000_000;
    (state as any).finances.carryover = 5_000_000;
    (state as any).finances.incentiveTrueUps = 1_000_000;
    (state as any).finances.deadCapThisYear = 10_000_000;

    const result = computeCapLedgerV2(state, "BEARS");
    const adjLine = result.lines.find((l) => l.id === "ADJUSTED_CAP")!;
    expect(adjLine.value).toBe(196_000_000); // 200 + 5 + 1 - 10
  });

  it("AVAILABLE_CAP = ADJUSTED_CAP - TOP_51_total", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([makePlayer("P001")] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(20_000_000) as any);

    const state = makeState();
    const result = computeCapLedgerV2(state, "BEARS");
    const availLine = result.lines.find((l) => l.id === "AVAILABLE_CAP")!;
    expect(availLine.value).toBe(180_000_000);
  });

  it("overCap alert fires when availableCap < 0", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([makePlayer("P001")] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(250_000_000) as any);

    const state = makeState();
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.alerts.overCap).toBe(true);
  });

  it("highDeadCapRisk alert fires when dead cap >= 12% of league cap", () => {
    const state = makeState();
    (state as any).finances.deadCapThisYear = 25_000_000; // 12.5% of 200M
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.alerts.highDeadCapRisk).toBe(true);
  });

  it("highDeadCapRisk is false when dead cap is below 12%", () => {
    const state = makeState();
    (state as any).finances.deadCapThisYear = 10_000_000; // 5% of 200M
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.alerts.highDeadCapRisk).toBe(false);
  });

  it("june1ReliefAvailable fires when any cut designation is POST_JUNE_1", () => {
    const state = makeState({
      offseasonData: { rosterAudit: { cutDesignations: { P001: "POST_JUNE_1" } } },
    });
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.alerts.june1ReliefAvailable).toBe(true);
  });

  it("june1ReliefAvailable is false when no POST_JUNE_1 designation", () => {
    const state = makeState({
      offseasonData: { rosterAudit: { cutDesignations: { P001: "STANDARD" } } },
    });
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.alerts.june1ReliefAvailable).toBe(false);
  });

  it("TOP_51 detail rows include player name, pos, and capHit", () => {
    vi.mocked(getEffectivePlayersByTeam).mockReturnValue([
      makePlayer("P001", { fullName: "John Doe", pos: "QB" }),
    ] as any);
    vi.mocked(getContractSummaryForPlayer).mockReturnValue(makeContractSummary(15_000_000) as any);

    const state = makeState();
    const result = computeCapLedgerV2(state, "BEARS");
    expect(result.top51.items[0].name).toBe("John Doe");
    expect(result.top51.items[0].pos).toBe("QB");
    expect(result.top51.items[0].capHit).toBe(15_000_000);
  });
});
