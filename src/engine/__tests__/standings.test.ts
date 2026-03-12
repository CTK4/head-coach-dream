import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock leagueDb so computeStandings can look up division/conference data
// without loading the full 11MB JSON.
vi.mock("@/data/leagueDb", () => ({
  getTeamById: vi.fn(),
}));

import { computeStandings } from "@/engine/standings";
import { getTeamById } from "@/data/leagueDb";
import type { TeamStanding } from "@/engine/standings";
import type { AIGameResult } from "@/engine/leagueSim";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTeamMeta(conference: string, division: string) {
  return { conferenceId: conference, divisionId: division };
}

function makeStanding(teamId: string, conference: string, division: string): TeamStanding {
  return {
    teamId,
    teamName: teamId,
    division,
    conference,
    wins: 0,
    losses: 0,
    ties: 0,
    winPct: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    divisionRecord: { w: 0, l: 0, t: 0 },
    conferenceRecord: { w: 0, l: 0, t: 0 },
    streak: "W0",
    lastFive: [],
  };
}

function makeGame(homeId: string, awayId: string, homeScore: number, awayScore: number): AIGameResult {
  return {
    homeTeamId: homeId,
    awayTeamId: awayId,
    homeScore,
    awayScore,
    weekNumber: 1,
    season: 2026,
  } as AIGameResult;
}

// Two-team setup: same conference + division
function setupMockTeams() {
  vi.mocked(getTeamById).mockImplementation((id: string) => {
    const teams: Record<string, ReturnType<typeof makeTeamMeta>> = {
      TEAM_A: makeTeamMeta("AFC", "AFC_NORTH"),
      TEAM_B: makeTeamMeta("AFC", "AFC_NORTH"),
      TEAM_C: makeTeamMeta("NFC", "NFC_SOUTH"),
      TEAM_D: makeTeamMeta("NFC", "NFC_SOUTH"),
    };
    return teams[id] as any;
  });
}

beforeEach(() => {
  vi.mocked(getTeamById).mockReset();
  setupMockTeams();
});

// ---------------------------------------------------------------------------
// Core win/loss/tie tracking
// ---------------------------------------------------------------------------

describe("computeStandings — win/loss tracking", () => {
  it("records a win for the winning team and a loss for the loser", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 28, 14)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    const b = standings.find((s) => s.teamId === "TEAM_B")!;
    expect(a.wins).toBe(1);
    expect(a.losses).toBe(0);
    expect(b.wins).toBe(0);
    expect(b.losses).toBe(1);
  });

  it("records a tie for both teams when scores are equal", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 17, 17)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    const b = standings.find((s) => s.teamId === "TEAM_B")!;
    expect(a.ties).toBe(1);
    expect(b.ties).toBe(1);
    expect(a.wins).toBe(0);
    expect(b.wins).toBe(0);
  });

  it("accumulates points for and against correctly", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 35, 21)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    const b = standings.find((s) => s.teamId === "TEAM_B")!;
    expect(a.pointsFor).toBe(35);
    expect(a.pointsAgainst).toBe(21);
    expect(b.pointsFor).toBe(21);
    expect(b.pointsAgainst).toBe(35);
  });

  it("accumulates results across multiple games", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [
      makeGame("TEAM_A", "TEAM_B", 28, 14), // A wins
      makeGame("TEAM_B", "TEAM_A", 21, 7),  // B wins
      makeGame("TEAM_A", "TEAM_B", 10, 10), // Tie
    ];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    expect(a.wins).toBe(1);
    expect(a.losses).toBe(1);
    expect(a.ties).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Win percentage
// ---------------------------------------------------------------------------

describe("computeStandings — winPct", () => {
  it("computes winPct as (W + 0.5*T) / G, rounded to 3 decimals", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [
      makeGame("TEAM_A", "TEAM_B", 28, 14), // W
      makeGame("TEAM_A", "TEAM_B", 14, 28), // L
      makeGame("TEAM_A", "TEAM_B", 10, 10), // T
    ];
    const standings = computeStandings(results, prev);
    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    // (1 + 0.5) / 3 = 0.5
    expect(a.winPct).toBe(0.5);
  });

  it("reports 0.000 winPct for an 0-0-0 team", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH")];
    const standings = computeStandings([], prev);
    expect(standings[0].winPct).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Division record tracking
// ---------------------------------------------------------------------------

describe("computeStandings — division record", () => {
  it("increments division win/loss for same-division teams", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 28, 14)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    const b = standings.find((s) => s.teamId === "TEAM_B")!;
    expect(a.divisionRecord.w).toBe(1);
    expect(b.divisionRecord.l).toBe(1);
  });

  it("does NOT increment division record for cross-division teams", () => {
    // TEAM_A (AFC_NORTH) vs TEAM_C (NFC_SOUTH) — different division
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_C", "NFC", "NFC_SOUTH")];
    const results = [makeGame("TEAM_A", "TEAM_C", 28, 14)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    const c = standings.find((s) => s.teamId === "TEAM_C")!;
    expect(a.divisionRecord.w).toBe(0);
    expect(c.divisionRecord.l).toBe(0);
    // Overall still updated
    expect(a.wins).toBe(1);
    expect(c.losses).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Conference record tracking
// ---------------------------------------------------------------------------

describe("computeStandings — conference record", () => {
  it("increments conference record for same-conference teams", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 28, 14)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    expect(a.conferenceRecord.w).toBe(1);
  });

  it("does NOT increment conference record for cross-conference teams", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_C", "NFC", "NFC_SOUTH")];
    const results = [makeGame("TEAM_A", "TEAM_C", 28, 14)];
    const standings = computeStandings(results, prev);

    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    expect(a.conferenceRecord.w).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Streak tracking
// ---------------------------------------------------------------------------

describe("computeStandings — streak", () => {
  it("updates streak for the most recent result", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 28, 14)];
    const standings = computeStandings(results, prev);
    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    expect(a.streak).toBe("W1");
  });

  it("tracks lastFive entries (capped at 5)", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = Array.from({ length: 7 }, (_, i) =>
      makeGame(i % 2 === 0 ? "TEAM_A" : "TEAM_B", i % 2 === 0 ? "TEAM_B" : "TEAM_A", 21, 14),
    );
    const standings = computeStandings(results, prev);
    const a = standings.find((s) => s.teamId === "TEAM_A")!;
    expect(a.lastFive.length).toBeLessThanOrEqual(5);
  });
});

// ---------------------------------------------------------------------------
// Ordering / sorting
// ---------------------------------------------------------------------------

describe("computeStandings — sorting", () => {
  it("orders higher-winPct team first within same conference", () => {
    const prev = [
      makeStanding("TEAM_A", "AFC", "AFC_NORTH"),
      makeStanding("TEAM_B", "AFC", "AFC_NORTH"),
    ];
    const results = [makeGame("TEAM_A", "TEAM_B", 28, 14)]; // A wins
    const standings = computeStandings(results, prev);
    const indices = standings.map((s) => s.teamId);
    expect(indices.indexOf("TEAM_A")).toBeLessThan(indices.indexOf("TEAM_B"));
  });

  it("groups teams by conference (conference A before conference B alphabetically)", () => {
    const prev = [
      makeStanding("TEAM_A", "AFC", "AFC_NORTH"),
      makeStanding("TEAM_B", "AFC", "AFC_NORTH"),
      makeStanding("TEAM_C", "NFC", "NFC_SOUTH"),
      makeStanding("TEAM_D", "NFC", "NFC_SOUTH"),
    ];
    const standings = computeStandings([], prev);
    const conferences = standings.map((s) => s.conference);
    const lastAfc = conferences.lastIndexOf("AFC");
    const firstNfc = conferences.indexOf("NFC");
    // All AFC teams should come before all NFC teams (or vice versa — sorted alphabetically)
    expect(lastAfc < firstNfc || firstNfc === -1 || lastAfc === -1).toBe(true);
  });

  it("skips games where team is not in previous standings", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_UNKNOWN", 28, 14)];
    // Should not throw; TEAM_UNKNOWN not in previousStandings so game is skipped
    expect(() => computeStandings(results, prev)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Idempotence
// ---------------------------------------------------------------------------

describe("computeStandings — idempotence", () => {
  it("returns same standings when called with same inputs twice", () => {
    const prev = [makeStanding("TEAM_A", "AFC", "AFC_NORTH"), makeStanding("TEAM_B", "AFC", "AFC_NORTH")];
    const results = [makeGame("TEAM_A", "TEAM_B", 28, 14)];
    const first = computeStandings(results, prev);
    const second = computeStandings(results, [...prev]);
    expect(first.map((s) => s.teamId)).toEqual(second.map((s) => s.teamId));
    expect(first.map((s) => s.wins)).toEqual(second.map((s) => s.wins));
  });
});
