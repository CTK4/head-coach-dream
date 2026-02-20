import { simulateFullGame } from "@/engine/gameSim";
import type { GameType, LeagueSchedule, Matchup } from "@/engine/schedule";
import type { PostseasonState } from "@/engine/postseason";

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
  gmByTeamId: Record<string, string>;
  postseason?: PostseasonState;
};

export function initLeagueState(teamIds: string[], season = new Date().getFullYear()): LeagueState {
  const standings: Record<string, TeamStanding> = {};
  for (const id of teamIds) standings[id] = { w: 0, l: 0, pf: 0, pa: 0 };

  const gmPool = [
    "PERS_0033",
    "PERS_0034",
    "PERS_0035",
    "PERS_0036",
    "PERS_0037",
    "PERS_0038",
    "PERS_0039",
    "PERS_0040",
    "PERS_0041",
    "PERS_0042",
    "PERS_0043",
    "PERS_0044",
    "PERS_0045",
    "PERS_0046",
    "PERS_0047",
    "PERS_0048",
    "PERS_0049",
    "PERS_0050",
    "PERS_0051",
    "PERS_0052",
    "PERS_0053",
    "PERS_0054",
    "PERS_0055",
    "PERS_0056",
    "PERS_0057",
    "PERS_0058",
    "PERS_0059",
    "PERS_0060",
    "PERS_0061",
    "PERS_0062",
    "PERS_0063",
    "PERS_0064",
  ];

  const gmByTeamId: Record<string, string> = {};
  for (let i = 0; i < teamIds.length; i += 1) {
    gmByTeamId[teamIds[i]] = gmPool[(season + i) % gmPool.length];
  }

  return { standings, results: [], gmByTeamId, postseason: { season, resultsByTeamId: {} } };
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

  return { standings, results: [...league.results, r], gmByTeamId: league.gmByTeamId, postseason: league.postseason };
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
