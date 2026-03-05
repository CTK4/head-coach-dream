import { describe, expect, it } from "vitest";
import { buildPlayoffBracket, simulateCpuPlayoffGamesForRound, advancePlayoffRound, buildPostseasonResults, getPlayoffRoundGames } from "@/engine/playoffsSim";
import { initLeagueState } from "@/engine/leagueSim";

// CC conference: MILWAUKEE_NORTHSHORE, ATLANTA_APEX
// FC conference: BALTIMORE_ADMIRALS, BOSTON_HARBORMEN
// Using 2 teams per conference so playoff bracket produces a Super Bowl
const TEAM_IDS = ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BALTIMORE_ADMIRALS", "BOSTON_HARBORMEN"];

function run(seed: number) {
  const league = initLeagueState(TEAM_IDS, 2026);
  league.standings.MILWAUKEE_NORTHSHORE = { w: 14, l: 3, pf: 450, pa: 280 };
  league.standings.ATLANTA_APEX = { w: 13, l: 4, pf: 430, pa: 300 };
  league.standings.BALTIMORE_ADMIRALS = { w: 12, l: 5, pf: 410, pa: 320 };
  league.standings.BOSTON_HARBORMEN = { w: 11, l: 6, pf: 390, pa: 340 };

  let playoffs = buildPlayoffBracket({ league, season: 2026 });
  for (let i = 0; i < 4; i += 1) {
    const sim = simulateCpuPlayoffGamesForRound({ playoffs, seed });
    playoffs = { ...playoffs, completedGames: sim.completedGames };
    const done = getPlayoffRoundGames(playoffs).every((g) => playoffs.completedGames[g.gameId]);
    if (playoffs.round === "SUPER_BOWL" && done) break;
    playoffs = advancePlayoffRound(playoffs);
  }
  const out = buildPostseasonResults({ league, playoffs });
  return {
    championTeamId: out.championTeamId,
    postseasonHash: JSON.stringify(out.postseason.resultsByTeamId),
  };
}

describe("golden playoffs determinism", () => {
  it("same seed yields same champion and postseason hash", () => {
    const a = run(12345);
    const b = run(12345);
    expect(a.championTeamId).toBe(b.championTeamId);
    expect(a.postseasonHash).toBe(b.postseasonHash);
  });
});
