import { describe, expect, it } from "vitest";
import type { LeagueState } from "@/engine/leagueSim";
import {
  computeOpponentWinPctExcludingTeam,
  computeOpponentsByTeamId,
  computeStrengthOfScheduleNFL,
  normalizeGames,
} from "@/engine/strengthOfSchedule";

function makeLeague(results: Array<{ homeTeamId: string; awayTeamId: string; homeScore: number; awayScore: number }>): LeagueState {
  const teams = new Set<string>();
  results.forEach((g) => {
    teams.add(g.homeTeamId);
    teams.add(g.awayTeamId);
  });

  const standings: LeagueState["standings"] = {};
  for (const teamId of teams) standings[teamId] = { w: 0, l: 0, pf: 0, pa: 0 };

  return {
    standings,
    results: results.map((result, i) => ({ gameType: "REGULAR_SEASON", week: i + 1, ...result })),
    postseason: { season: 2026, resultsByTeamId: {} },
  };
}

describe("strengthOfSchedule", () => {
  it("derive opponents from results", () => {
    const league = makeLeague([
      { homeTeamId: "A", awayTeamId: "B", homeScore: 21, awayScore: 17 },
      { homeTeamId: "B", awayTeamId: "C", homeScore: 24, awayScore: 20 },
    ]);

    const opponents = computeOpponentsByTeamId(league);
    expect(opponents.A).toEqual(["B"]);
    expect(opponents.B).toEqual(["A", "C"]);
    expect(opponents.C).toEqual(["B"]);
  });

  it("excludes head-to-head games when computing opponent win%", () => {
    const league = makeLeague([
      { homeTeamId: "A", awayTeamId: "B", homeScore: 30, awayScore: 10 },
      { homeTeamId: "A", awayTeamId: "B", homeScore: 27, awayScore: 13 },
      { homeTeamId: "B", awayTeamId: "C", homeScore: 21, awayScore: 20 },
      { homeTeamId: "B", awayTeamId: "D", homeScore: 24, awayScore: 23 },
    ]);

    const games = normalizeGames(league);
    const pct = computeOpponentWinPctExcludingTeam(games, "B", "A");
    expect(pct).toBe(1);
  });

  it("returns 0 when opponent only played target team", () => {
    const league = makeLeague([{ homeTeamId: "A", awayTeamId: "B", homeScore: 14, awayScore: 7 }]);

    const games = normalizeGames(league);
    expect(computeOpponentWinPctExcludingTeam(games, "B", "A")).toBe(0);
  });

  it("returns neutral 0.5 when no opponents exist", () => {
    const league: LeagueState = {
      standings: { A: { w: 0, l: 0, pf: 0, pa: 0 } },
      results: [],
      postseason: { season: 2026, resultsByTeamId: {} },
    };

    expect(computeStrengthOfScheduleNFL(league, "A")).toBe(0.5);
  });
});
