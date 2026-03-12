import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/data/leagueDb", () => ({
  getTeamById: vi.fn(),
}));

// strengthOfSchedule.normalizeGames reads league.results — we use it as-is.
// We just need getTeamById to return team meta for tiebreaks.

import { computeSplitRecords, computeCommonGamesWinPct, recordWinPct } from "@/engine/tiebreaks";
import { getTeamById } from "@/data/leagueDb";
import type { LeagueState } from "@/engine/leagueSim";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTeamMeta(conference: string, division: string) {
  return { conferenceId: conference, divisionId: division };
}

function makeLeagueState(teams: string[], results: Array<{
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
}>): LeagueState {
  const standings: Record<string, unknown> = {};
  for (const t of teams) standings[t] = {};
  return { standings, results } as unknown as LeagueState;
}

function setupMockTeams(teamMeta: Record<string, { conference: string; division: string }>) {
  vi.mocked(getTeamById).mockImplementation((id: string) => {
    const m = teamMeta[id];
    if (!m) return null as any;
    return { conferenceId: m.conference, divisionId: m.division } as any;
  });
}

beforeEach(() => {
  vi.mocked(getTeamById).mockReset();
});

// ---------------------------------------------------------------------------
// recordWinPct
// ---------------------------------------------------------------------------

describe("recordWinPct", () => {
  it("returns null when record is undefined", () => {
    expect(recordWinPct(undefined)).toBeNull();
  });

  it("returns null for a 0-0 record (no games played)", () => {
    expect(recordWinPct({ w: 0, l: 0 })).toBeNull();
  });

  it("computes 1.000 for an undefeated record", () => {
    expect(recordWinPct({ w: 5, l: 0 })).toBe(1);
  });

  it("computes 0.000 for a winless record", () => {
    expect(recordWinPct({ w: 0, l: 5 })).toBe(0);
  });

  it("computes 0.5 for a .500 record", () => {
    expect(recordWinPct({ w: 4, l: 4 })).toBe(0.5);
  });

  it("computes correct value for an odd record", () => {
    // 3W, 1L = 3/4 = 0.75
    expect(recordWinPct({ w: 3, l: 1 })).toBeCloseTo(0.75);
  });
});

// ---------------------------------------------------------------------------
// computeSplitRecords
// ---------------------------------------------------------------------------

describe("computeSplitRecords", () => {
  it("initializes all teams to 0-0 when no results", () => {
    setupMockTeams({
      TEAM_A: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_B: { conference: "AFC", division: "AFC_NORTH" },
    });
    const league = makeLeagueState(["TEAM_A", "TEAM_B"], []);
    const { overall } = computeSplitRecords(league);

    expect(overall.TEAM_A).toEqual({ w: 0, l: 0 });
    expect(overall.TEAM_B).toEqual({ w: 0, l: 0 });
  });

  it("records overall win/loss for both participants", () => {
    setupMockTeams({
      TEAM_A: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_B: { conference: "AFC", division: "AFC_NORTH" },
    });
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B"],
      [{ homeTeamId: "TEAM_A", awayTeamId: "TEAM_B", homeScore: 28, awayScore: 14 }],
    );
    const { overall } = computeSplitRecords(league);

    expect(overall.TEAM_A).toEqual({ w: 1, l: 0 });
    expect(overall.TEAM_B).toEqual({ w: 0, l: 1 });
  });

  it("records conference split only for same-conference games", () => {
    setupMockTeams({
      TEAM_A: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_B: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_C: { conference: "NFC", division: "NFC_SOUTH" },
    });
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C"],
      [
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_B", homeScore: 28, awayScore: 14 }, // same conf
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_C", homeScore: 21, awayScore: 7 },  // cross-conf
      ],
    );
    const { conference } = computeSplitRecords(league);

    // Same-conference win counts
    expect(conference.TEAM_A.w).toBe(1);
    expect(conference.TEAM_B.l).toBe(1);
    // Cross-conference game should NOT count
    expect(conference.TEAM_C.l).toBe(0);
  });

  it("records division split only for same-division games", () => {
    setupMockTeams({
      TEAM_A: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_B: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_C: { conference: "AFC", division: "AFC_EAST" },
    });
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C"],
      [
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_B", homeScore: 28, awayScore: 14 }, // same div
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_C", homeScore: 21, awayScore: 7 },  // diff div
      ],
    );
    const { division } = computeSplitRecords(league);

    expect(division.TEAM_A.w).toBe(1);
    expect(division.TEAM_B.l).toBe(1);
    // Cross-division: no division credit
    expect(division.TEAM_C.l).toBe(0);
  });

  it("records opponents for each team", () => {
    setupMockTeams({
      TEAM_A: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_B: { conference: "AFC", division: "AFC_NORTH" },
    });
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B"],
      [{ homeTeamId: "TEAM_A", awayTeamId: "TEAM_B", homeScore: 28, awayScore: 14 }],
    );
    const { opponentsByTeamId } = computeSplitRecords(league);

    expect(opponentsByTeamId.TEAM_A).toContain("TEAM_B");
    expect(opponentsByTeamId.TEAM_B).toContain("TEAM_A");
  });

  it("handles ties (neither win nor loss credited)", () => {
    setupMockTeams({
      TEAM_A: { conference: "AFC", division: "AFC_NORTH" },
      TEAM_B: { conference: "AFC", division: "AFC_NORTH" },
    });
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B"],
      [{ homeTeamId: "TEAM_A", awayTeamId: "TEAM_B", homeScore: 17, awayScore: 17 }],
    );
    const { overall } = computeSplitRecords(league);

    // Tiebreaks module doesn't track ties — scores equal → neither homeWon nor awayWon
    expect(overall.TEAM_A.w).toBe(0);
    expect(overall.TEAM_A.l).toBe(0);
    expect(overall.TEAM_B.w).toBe(0);
    expect(overall.TEAM_B.l).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeCommonGamesWinPct
// ---------------------------------------------------------------------------

describe("computeCommonGamesWinPct", () => {
  it("returns null when commonOpponentsSet is empty", () => {
    const league = makeLeagueState(["TEAM_A"], []);
    expect(computeCommonGamesWinPct(league, "TEAM_A", new Set())).toBeNull();
  });

  it("returns null when team has no games vs common opponents", () => {
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C"],
      [{ homeTeamId: "TEAM_B", awayTeamId: "TEAM_C", homeScore: 21, awayScore: 14 }],
    );
    // TEAM_A has zero games vs TEAM_C
    const result = computeCommonGamesWinPct(league, "TEAM_A", new Set(["TEAM_C"]));
    expect(result).toBeNull();
  });

  it("returns 1.0 when team wins all games vs common opponents", () => {
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C"],
      [
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_C", homeScore: 28, awayScore: 14 },
        { homeTeamId: "TEAM_B", awayTeamId: "TEAM_C", homeScore: 35, awayScore: 10 },
      ],
    );
    const result = computeCommonGamesWinPct(league, "TEAM_A", new Set(["TEAM_C"]));
    expect(result).toBe(1);
  });

  it("returns 0.0 when team loses all games vs common opponents", () => {
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C"],
      [{ homeTeamId: "TEAM_C", awayTeamId: "TEAM_A", homeScore: 28, awayScore: 14 }],
    );
    const result = computeCommonGamesWinPct(league, "TEAM_A", new Set(["TEAM_C"]));
    expect(result).toBe(0);
  });

  it("returns 0.5 for a 1-1 record vs common opponents", () => {
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C"],
      [
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_C", homeScore: 28, awayScore: 14 }, // A wins
        { homeTeamId: "TEAM_C", awayTeamId: "TEAM_A", homeScore: 21, awayScore: 7 },  // A loses
      ],
    );
    const result = computeCommonGamesWinPct(league, "TEAM_A", new Set(["TEAM_C"]));
    expect(result).toBe(0.5);
  });

  it("ignores games vs teams not in the common opponents set", () => {
    const league = makeLeagueState(
      ["TEAM_A", "TEAM_B", "TEAM_C", "TEAM_D"],
      [
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_C", homeScore: 28, awayScore: 14 }, // vs common
        { homeTeamId: "TEAM_A", awayTeamId: "TEAM_D", homeScore: 7, awayScore: 21 },  // vs non-common (ignored)
      ],
    );
    const result = computeCommonGamesWinPct(league, "TEAM_A", new Set(["TEAM_C"]));
    expect(result).toBe(1); // Only the win counts
  });
});
