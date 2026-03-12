import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/data/leagueDb", () => ({
  getPlayerById: vi.fn(() => null),
  getContractById: vi.fn(() => null),
  getPlayers: vi.fn(() => []),
}));

vi.mock("@/engine/transactions/applyTransactions", () => ({
  buildRosterIndex: vi.fn(() => ({
    playerToTeam: {},
    freeAgents: new Set(),
    teamToPlayers: {},
  })),
}));

vi.mock("@/engine/transactions/contractIndex", () => ({
  buildContractIndex: vi.fn(() => ({})),
}));

vi.mock("@/engine/snapBasedProgression", () => ({
  CORE_ATTRIBUTE_KEYS: ["passing", "speed", "strength"],
}));

import {
  normalizePos,
  capHitForOverride,
  getContractSummaryForPlayer,
  getEffectivePlayer,
  getEffectivePlayersByTeam,
} from "@/engine/rosterOverlay";
import { getPlayerById, getContractById, getPlayers } from "@/data/leagueDb";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import type { GameState, PlayerContractOverride } from "@/context/GameContext";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEASON = 2026;

function makeState(overrides: Record<string, unknown> = {}): GameState {
  return {
    season: SEASON,
    playerContractOverrides: {},
    playerTeamOverrides: {},
    rookies: [],
    playerAttributeDeltas: {},
    ...overrides,
  } as unknown as GameState;
}

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

beforeEach(() => {
  vi.mocked(getPlayerById).mockReturnValue(null);
  vi.mocked(getContractById).mockReturnValue(null);
  vi.mocked(getPlayers).mockReturnValue([]);
  vi.mocked(buildRosterIndex).mockReturnValue({
    playerToTeam: {},
    freeAgents: new Set(),
    teamToPlayers: {},
  } as any);
  vi.mocked(buildContractIndex).mockReturnValue({} as any);
});

// ---------------------------------------------------------------------------
// normalizePos
// ---------------------------------------------------------------------------

describe("normalizePos", () => {
  it("normalizes HB → RB", () => expect(normalizePos("HB")).toBe("RB"));
  it("normalizes OLB → LB", () => expect(normalizePos("OLB")).toBe("LB"));
  it("normalizes ILB → LB", () => expect(normalizePos("ILB")).toBe("LB"));
  it("normalizes MLB → LB", () => expect(normalizePos("MLB")).toBe("LB"));
  it("normalizes SS → S", () => expect(normalizePos("SS")).toBe("S"));
  it("normalizes FS → S", () => expect(normalizePos("FS")).toBe("S"));
  it("normalizes DT → DL", () => expect(normalizePos("DT")).toBe("DL"));
  it("normalizes DE → EDGE", () => expect(normalizePos("DE")).toBe("EDGE"));
  it("normalizes DB → CB", () => expect(normalizePos("DB")).toBe("CB"));
  it("normalizes OT → OL", () => expect(normalizePos("OT")).toBe("OL"));
  it("normalizes OG → OL", () => expect(normalizePos("OG")).toBe("OL"));

  it("passes through already-normalized QB", () => expect(normalizePos("QB")).toBe("QB"));
  it("passes through WR", () => expect(normalizePos("WR")).toBe("WR"));
  it("passes through CB", () => expect(normalizePos("CB")).toBe("CB"));

  it("handles lowercase input", () => expect(normalizePos("hb")).toBe("RB"));

  it("returns UNK for empty string", () => expect(normalizePos("")).toBe("UNK"));
});

// ---------------------------------------------------------------------------
// capHitForOverride — exercises parseMoney + round50k indirectly
// ---------------------------------------------------------------------------

describe("capHitForOverride", () => {
  it("returns salary + bonus proration for current season", () => {
    const o = makeOverride({ prorationBySeason: { [SEASON]: 1_000_000 }, signingBonus: 0 });
    // salary[0] = 5M + proration[2026] = 1M → 6M
    expect(capHitForOverride(o, SEASON)).toBe(6_000_000);
  });

  it("uses signing bonus fallback proration when no per-season proration", () => {
    const o = makeOverride({ prorationBySeason: {}, signingBonus: 3_000_000 });
    // 3M bonus / 3 years = 1M per year; salary[0] = 5M → 6M
    expect(capHitForOverride(o, SEASON)).toBe(6_000_000);
  });

  it("only salary counts when signingBonus is 0 and no proration", () => {
    const o = makeOverride({ prorationBySeason: {}, signingBonus: 0 });
    expect(capHitForOverride(o, SEASON)).toBe(5_000_000);
  });

  it("rounds to nearest 50k", () => {
    const o = makeOverride({ salaries: [5_025_000], prorationBySeason: {}, signingBonus: 0 });
    expect(capHitForOverride(o, SEASON) % 50_000).toBe(0);
  });

  it("clamps salary index for a season beyond contract end", () => {
    // endSeason = 2026 + 2, but we request season 2030 → clamped to last salary
    const o = makeOverride();
    const result = capHitForOverride(o, 2030);
    expect(result).toBeGreaterThan(0); // uses last salary in array, no crash
  });
});

// ---------------------------------------------------------------------------
// getContractSummaryForPlayer — override path
// ---------------------------------------------------------------------------

describe("getContractSummaryForPlayer — override path", () => {
  it("returns null when no override and no DB contract", () => {
    const state = makeState();
    expect(getContractSummaryForPlayer(state, "P001")).toBeNull();
  });

  it("returns a summary with isOverride: true when playerContractOverrides is set", () => {
    const override = makeOverride();
    const state = makeState({ playerContractOverrides: { P001: override } });
    const result = getContractSummaryForPlayer(state, "P001");
    expect(result).not.toBeNull();
    expect(result?.isOverride).toBe(true);
  });

  it("computes correct capHit from salary + proration for current season", () => {
    const override = makeOverride({ prorationBySeason: {}, signingBonus: 3_000_000 });
    const state = makeState({ playerContractOverrides: { P001: override } });
    const result = getContractSummaryForPlayer(state, "P001");
    // salary 5M + 1M proration = 6M
    expect(result?.capHit).toBe(6_000_000);
  });

  it("computes yearsRemaining = endSeason - season + 1", () => {
    const override = makeOverride({ startSeason: SEASON, endSeason: SEASON + 2 });
    const state = makeState({ playerContractOverrides: { P001: override } });
    const result = getContractSummaryForPlayer(state, "P001");
    expect(result?.yearsRemaining).toBe(3);
  });

  it("clamps yearsRemaining to >= 0 for an expired contract", () => {
    const override = makeOverride({ startSeason: SEASON - 5, endSeason: SEASON - 1 });
    const state = makeState({ playerContractOverrides: { P001: override } });
    const result = getContractSummaryForPlayer(state, "P001");
    expect(result?.yearsRemaining).toBeGreaterThanOrEqual(0);
  });

  it("deadCapIfCutNow > 0 for contract with remaining proration", () => {
    // Use explicit prorationBySeason so sumObj finds actual values (empty {} is truthy
    // but yields 0 from sumObj). Provide $3M/year for all 3 contract years.
    const override = makeOverride({
      signingBonus: 9_000_000,
      prorationBySeason: { [SEASON]: 3_000_000, [SEASON + 1]: 3_000_000, [SEASON + 2]: 3_000_000 },
    });
    const state = makeState({ playerContractOverrides: { P001: override } });
    const result = getContractSummaryForPlayer(state, "P001");
    expect(result?.deadCapIfCutNow).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// getContractSummaryForPlayer — DB path
// ---------------------------------------------------------------------------

describe("getContractSummaryForPlayer — DB path", () => {
  it("returns null when player has no contractId in DB", () => {
    vi.mocked(getPlayerById).mockReturnValue({ playerId: "P001" } as any);
    const state = makeState();
    expect(getContractSummaryForPlayer(state, "P001")).toBeNull();
  });

  it("returns null when contractId points to missing contract", () => {
    vi.mocked(getPlayerById).mockReturnValue({ playerId: "P001", contractId: "C001" } as any);
    vi.mocked(getContractById).mockReturnValue(null);
    const state = makeState();
    expect(getContractSummaryForPlayer(state, "P001")).toBeNull();
  });

  it("returns summary with isOverride: false when DB contract is found", () => {
    vi.mocked(getPlayerById).mockReturnValue({ playerId: "P001", contractId: "C001" } as any);
    vi.mocked(getContractById).mockReturnValue({
      contractId: "C001",
      startSeason: SEASON,
      endSeason: SEASON,
      salaryY1: 5_000_000,
    } as any);
    const state = makeState();
    const result = getContractSummaryForPlayer(state, "P001");
    expect(result).not.toBeNull();
    expect(result?.isOverride).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getEffectivePlayer
// ---------------------------------------------------------------------------

describe("getEffectivePlayer", () => {
  it("returns undefined when player is not on any roster", () => {
    const state = makeState();
    expect(getEffectivePlayer(state, "GHOST")).toBeUndefined();
  });

  it("returns a player object when DB player matches via rosterIndex", () => {
    vi.mocked(getPlayers).mockReturnValue([
      { playerId: "P001", fullName: "Test Player", pos: "QB", teamId: "BEARS" } as any,
    ]);
    vi.mocked(buildRosterIndex).mockReturnValue({
      playerToTeam: { P001: "BEARS" },
      freeAgents: new Set(),
      teamToPlayers: { BEARS: ["P001"] },
    } as any);
    const state = makeState();
    const result = getEffectivePlayer(state, "P001");
    expect(result).toBeDefined();
    expect(String(result?.playerId)).toBe("P001");
  });
});

// ---------------------------------------------------------------------------
// getEffectivePlayersByTeam
// ---------------------------------------------------------------------------

describe("getEffectivePlayersByTeam", () => {
  it("returns empty array when no players are on the team", () => {
    const state = makeState();
    expect(getEffectivePlayersByTeam(state, "BEARS")).toHaveLength(0);
  });

  it("returns only players matching the specified teamId", () => {
    vi.mocked(getPlayers).mockReturnValue([
      { playerId: "P001", fullName: "Bear Player", pos: "QB", teamId: "BEARS" },
      { playerId: "P002", fullName: "Packer Player", pos: "RB", teamId: "PACKERS" },
    ] as any);
    vi.mocked(buildRosterIndex).mockReturnValue({
      playerToTeam: { P001: "BEARS", P002: "PACKERS" },
      freeAgents: new Set(),
      teamToPlayers: { BEARS: ["P001"], PACKERS: ["P002"] },
    } as any);
    const state = makeState();
    const bears = getEffectivePlayersByTeam(state, "BEARS");
    expect(bears.every((p: any) => String(p.teamId) === "BEARS")).toBe(true);
  });

  it("applies playerTeamOverrides (player moves to override team)", () => {
    vi.mocked(getPlayers).mockReturnValue([
      { playerId: "P001", fullName: "Traded Player", pos: "WR", teamId: "PACKERS" },
    ] as any);
    vi.mocked(buildRosterIndex).mockReturnValue({
      playerToTeam: { P001: "BEARS" }, // override in rosterIndex
      freeAgents: new Set(),
      teamToPlayers: { BEARS: ["P001"] },
    } as any);
    const state = makeState({ playerTeamOverrides: { P001: "BEARS" } });
    const bears = getEffectivePlayersByTeam(state, "BEARS");
    // P001 should appear on BEARS roster
    expect(bears.some((p: any) => String(p.playerId) === "P001")).toBe(true);
  });
});
