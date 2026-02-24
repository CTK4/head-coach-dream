import type { GameState } from "@/context/GameContext";
import type { LeagueState } from "@/engine/leagueSim";

export type NormalizedGame = {
  week?: number;
  homeId: string;
  awayId: string;
  homeScore: number;
  awayScore: number;
};

export function normalizeGames(league: LeagueState): NormalizedGame[] {
  return (league.results ?? [])
    .map((r) => ({ week: r.week, homeId: r.homeTeamId, awayId: r.awayTeamId, homeScore: Number(r.homeScore), awayScore: Number(r.awayScore) }))
    .filter((g) => g.homeId && g.awayId && Number.isFinite(g.homeScore) && Number.isFinite(g.awayScore));
}

export type LastGameInfo = { week?: number; opponentId: string; isHome: boolean; teamScore: number; opponentScore: number; result: "W" | "L" | "T" };

export function getLastGameForTeam(league: LeagueState, teamId: string): LastGameInfo | null {
  const games = normalizeGames(league)
    .filter((g) => g.homeId === teamId || g.awayId === teamId)
    .sort((a, b) => (a.week ?? 0) - (b.week ?? 0));
  const last = games[games.length - 1];
  if (!last) return null;
  const isHome = last.homeId === teamId;
  const teamScore = isHome ? last.homeScore : last.awayScore;
  const opponentScore = isHome ? last.awayScore : last.homeScore;
  const result: "W" | "L" | "T" = teamScore === opponentScore ? "T" : teamScore > opponentScore ? "W" : "L";
  return { week: last.week, opponentId: isHome ? last.awayId : last.homeId, isHome, teamScore, opponentScore, result };
}

export type NextGameInfo = { week?: number; opponentId: string; isHome: boolean };

export function getNextGameForTeam(state: GameState, _league: LeagueState, teamId: string): NextGameInfo | null {
  const schedule = state.hub.schedule;
  if (!schedule) return null;
  const currentWeek = state.hub.regularSeasonWeek ?? 1;
  for (const week of schedule.regularSeasonWeeks) {
    if (week.week < currentWeek) continue;
    const matchup = week.matchups.find((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
    if (!matchup) continue;
    const alreadyPlayed = (state.league.results ?? []).some((r) =>
      r.gameType === "REGULAR_SEASON" && r.week === week.week &&
      ((r.homeTeamId === matchup.homeTeamId && r.awayTeamId === matchup.awayTeamId) || (r.homeTeamId === matchup.awayTeamId && r.awayTeamId === matchup.homeTeamId))
    );
    if (alreadyPlayed) continue;
    return { week: week.week, opponentId: matchup.homeTeamId === teamId ? matchup.awayTeamId : matchup.homeTeamId, isHome: matchup.homeTeamId === teamId };
  }
  return null;
}

export type StreakInfo = { kind: "W" | "L" | "T"; count: number };

export function computeStreak(league: LeagueState, teamId: string): StreakInfo | null {
  const outcomes = normalizeGames(league)
    .filter((g) => g.homeId === teamId || g.awayId === teamId)
    .sort((a, b) => (a.week ?? 0) - (b.week ?? 0))
    .map((game) => {
      const isHome = game.homeId === teamId;
      const teamScore = isHome ? game.homeScore : game.awayScore;
      const oppScore = isHome ? game.awayScore : game.homeScore;
      if (teamScore > oppScore) return "W" as const;
      if (teamScore < oppScore) return "L" as const;
      return "T" as const;
    });

  if (!outcomes.length) return null;
  const kind = outcomes[outcomes.length - 1];
  let count = 0;
  for (let i = outcomes.length - 1; i >= 0; i -= 1) {
    if (outcomes[i] !== kind) break;
    count += 1;
  }
  return { kind, count };
}
