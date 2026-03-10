import { describe, expect, it } from "vitest";
import { getTeams } from "@/data/leagueDb";
import { initTeamStandings, simulateWeek } from "@/engine/leagueSim";
import { getWeekSeed } from "@/engine/rng";
import { deriveCareerSeed } from "@/engine/determinism/seedDerivation";
import { generateLeagueSchedule, type GameType } from "@/engine/schedule";

describe("week seed parity", () => {
  it("keeps CPU game results identical between Sim Week and PBP resolve routes", () => {
    const saveSeed = 872341;
    const baseSeed = deriveCareerSeed(saveSeed);
    const season = 2029;
    const gameType: GameType = "REGULAR_SEASON";
    const week = 3;

    const teamIds = getTeams()
      .filter((team) => team.isActive !== false)
      .map((team) => team.teamId);
    const schedule = generateLeagueSchedule(teamIds, saveSeed);
    const weekSchedule = schedule.regularSeasonWeeks.find((w) => w.week === week);
    expect(weekSchedule).toBeTruthy();

    const matchup = weekSchedule!.matchups[0];
    const seed = getWeekSeed(baseSeed, season, gameType, week);
    const previousStandings = initTeamStandings(teamIds);

    const simWeekResult = simulateWeek({
      schedule,
      gameType,
      week,
      userHomeTeamId: matchup.homeTeamId,
      userAwayTeamId: matchup.awayTeamId,
      seed,
      previousStandings,
      priorWeekResults: [],
    });

    const pbpResolveResult = simulateWeek({
      schedule,
      gameType,
      week,
      userHomeTeamId: matchup.homeTeamId,
      userAwayTeamId: matchup.awayTeamId,
      userScore: { homeScore: 31, awayScore: 17 },
      seed,
      previousStandings,
      priorWeekResults: [],
    });

    const isUserGame = (homeTeamId: string, awayTeamId: string) =>
      (homeTeamId === matchup.homeTeamId && awayTeamId === matchup.awayTeamId) ||
      (homeTeamId === matchup.awayTeamId && awayTeamId === matchup.homeTeamId);

    const cpuFromSimRoute = simWeekResult.allGameResults.filter((g) => !isUserGame(g.homeTeamId, g.awayTeamId));
    const cpuFromPbpRoute = pbpResolveResult.allGameResults.filter((g) => !isUserGame(g.homeTeamId, g.awayTeamId));

    expect(cpuFromPbpRoute).toEqual(cpuFromSimRoute);
  });
});
