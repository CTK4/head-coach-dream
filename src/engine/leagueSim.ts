import { simulateFullGame } from "@/engine/gameSim";
import type { GameType, LeagueSchedule, Matchup } from "@/engine/schedule";

export type TeamStanding = { w: number; l: number; pf: number; pa: number };
export type WeekResult = {
  gameType: GameType;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
};

export type LeagueState = {
  standings: Record<string, TeamStanding>;
  results: WeekResult[];
};

export function initLeagueState(teamIds: string[]): LeagueState {
  const standings: Record<string, TeamStanding> = {};
  for (const id of teamIds) standings[id] = { w: 0, l: 0, pf: 0, pa: 0 };
  return { standings, results: [] };
}

function applyResult(league: LeagueState, r: WeekResult): LeagueState {
  const standings = { ...league.standings };
  const home = { ...(standings[r.homeTeamId] ?? { w: 0, l: 0, pf: 0, pa: 0 }) };
  const away = { ...(standings[r.awayTeamId] ?? { w: 0, l: 0, pf: 0, pa: 0 }) };

  home.pf += r.homeScore;
  home.pa += r.awayScore;
  away.pf += r.awayScore;
  away.pa += r.homeScore;

  if (r.homeScore > r.awayScore) {
    home.w += 1;
    away.l += 1;
  } else if (r.awayScore > r.homeScore) {
    away.w += 1;
    home.l += 1;
  }

  standings[r.homeTeamId] = home;
  standings[r.awayTeamId] = away;

  return { standings, results: [...league.results, r] };
}

function hashMatchup(m: Matchup): number {
  let h = 2166136261;
  const s = `${m.homeTeamId}|${m.awayTeamId}`;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function simulateLeagueWeek(params: {
  schedule: LeagueSchedule;
  gameType: GameType;
  week: number;
  userHomeTeamId: string;
  userAwayTeamId: string;
  userScore: { homeScore: number; awayScore: number };
  seed: number;
  league: LeagueState;
}): LeagueState {
  const { schedule, gameType, week, userHomeTeamId, userAwayTeamId, userScore, seed } = params;
  const ws =
    gameType === "PRESEASON"
      ? schedule.preseasonWeeks.find((w) => w.week === week)
      : schedule.regularSeasonWeeks.find((w) => w.week === week);
  if (!ws) return params.league;

  let league = params.league;
  for (const m of ws.matchups) {
    const isUserGame =
      (m.homeTeamId === userHomeTeamId && m.awayTeamId === userAwayTeamId) ||
      (m.homeTeamId === userAwayTeamId && m.awayTeamId === userHomeTeamId);

    const scores = isUserGame
      ? userScore
      : simulateFullGame({ homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, seed: seed + hashMatchup(m) + week * 997 });

    league = applyResult(league, { gameType, week, homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, ...scores });
  }

  return league;
}
