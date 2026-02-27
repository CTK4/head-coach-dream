import { simulateFullGame } from "@/engine/gameSim";
import type { GameType, LeagueSchedule, Matchup } from "@/engine/schedule";
import { REGULAR_SEASON_WEEKS } from "@/engine/schedule";
import { TRADE_DEADLINE_DEFAULT_WEEK } from "@/engine/tradeDeadline";
import type { PostseasonState } from "@/engine/postseason";
import type { LeaguePhase, LeaguePlayoffs } from "@/engine/leaguePhase";
import { CURRENT_SEASON_YEAR } from "@/config/season";
import { getTeamById, getTeamRosterPlayers } from "@/data/leagueDb";
import { computeStandings, type TeamStanding } from "@/engine/standings";

/**
 * AUDIT NOTES (pre-change findings requested by task):
 * - Weekly entrypoint was `simulateLeagueWeek(params)`.
 * - It iterated all matchups in the selected week schedule (`for (const m of ws.matchups)`),
 *   using user score for one matchup and `simulateFullGame` for non-user games.
 * - It returned `LeagueState` (standings record + appended results) and was consumed by
 *   `GameContext` weekly advancement paths (`RESOLVE_PLAY` and `ADVANCE_WEEK`).
 * - No week-level aggregate return object, no league stat leaders, and no explicit TODO blocks.
 */

export type TeamStandingRecord = { w: number; l: number; pf: number; pa: number };
export type WeekResultRecord = {
  gameType: GameType;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
};

export type LeagueState = {
  phase: LeaguePhase;
  weekIndex: number;
  playoffRound?: number;
  playoffs: LeaguePlayoffs;
  standings: Record<string, TeamStandingRecord>;
  results: WeekResultRecord[];
  gmByTeamId: Record<string, string>;
  postseason?: PostseasonState;
  week: number;
  tradeDeadlineWeek: number;
};

export interface AIGameResult {
  gameId: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  homePassingYards: number;
  awayPassingYards: number;
  homeRushingYards: number;
  awayRushingYards: number;
  homeHeadline: { playerName: string; type: "RUSH" | "PASS"; value: number };
  awayHeadline: { playerName: string; type: "RUSH" | "PASS"; value: number };
  homeReceivingLeader: { playerName: string; value: number };
  awayReceivingLeader: { playerName: string; value: number };
  homeSackLeader: { playerName: string; value: number };
  awaySackLeader: { playerName: string; value: number };
}

export interface LeagueStatLeaders {
  passingYards: { playerName: string; teamId: string; value: number }[];
  rushingYards: { playerName: string; teamId: string; value: number }[];
  receivingYards: { playerName: string; teamId: string; value: number }[];
  sacks: { playerName: string; teamId: string; value: number }[];
}

export interface WeekResult {
  week: number;
  userGameId: string;
  allGameResults: AIGameResult[];
  updatedStandings: TeamStanding[];
  statLeaders: LeagueStatLeaders;
}

export function initLeagueState(teamIds: string[], season = CURRENT_SEASON_YEAR, tradeDeadlineWeek = 10): LeagueState {
  if (!Number.isInteger(tradeDeadlineWeek) || tradeDeadlineWeek < 1 || tradeDeadlineWeek >= REGULAR_SEASON_WEEKS) {
    throw new Error(`Invalid tradeDeadlineWeek ${tradeDeadlineWeek}. Must be >= 1 and < ${REGULAR_SEASON_WEEKS}.`);
  }
  const standings: Record<string, TeamStandingRecord> = {};
  for (const id of teamIds) standings[id] = { w: 0, l: 0, pf: 0, pa: 0 };

  const gmPool = [
    "PERS_0033", "PERS_0034", "PERS_0035", "PERS_0036", "PERS_0037", "PERS_0038", "PERS_0039", "PERS_0040",
    "PERS_0041", "PERS_0042", "PERS_0043", "PERS_0044", "PERS_0045", "PERS_0046", "PERS_0047", "PERS_0048",
    "PERS_0049", "PERS_0050", "PERS_0051", "PERS_0052", "PERS_0053", "PERS_0054", "PERS_0055", "PERS_0056",
    "PERS_0057", "PERS_0058", "PERS_0059", "PERS_0060", "PERS_0061", "PERS_0062", "PERS_0063", "PERS_0064",
  ];

  const gmByTeamId: Record<string, string> = {};
  for (let i = 0; i < teamIds.length; i += 1) gmByTeamId[teamIds[i]] = gmPool[(season + i) % gmPool.length];

  return {
    phase: "PRESEASON",
    weekIndex: 1,
    playoffs: {
      bracket: { wildCard: [], divisional: [], conference: [], championship: null },
      results: {},
      activeSeasonTeams: [...teamIds],
    },
    standings,
    results: [],
    gmByTeamId,
    postseason: { season, resultsByTeamId: {} },
    week: 1,
    tradeDeadlineWeek,
  };
}

function applyResult(standings: Record<string, TeamStandingRecord>, r: WeekResultRecord): void {
  const home = standings[r.homeTeamId] ?? { w: 0, l: 0, pf: 0, pa: 0 };
  const away = standings[r.awayTeamId] ?? { w: 0, l: 0, pf: 0, pa: 0 };
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

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number) {
  const u = 1 - rand();
  const v = 1 - rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function teamStrength(teamId: string) {
  const roster = getTeamRosterPlayers(teamId)
    .filter((p) => String(p.status ?? "").toUpperCase() !== "IR")
    .map((p) => Number(p.overall ?? 65))
    .sort((a, b) => b - a);
  const top22 = roster.slice(0, 22);
  if (!top22.length) return 68;
  return top22.reduce((s, n) => s + n, 0) / top22.length;
}

function topName(teamId: string, positions: string[]) {
  const top = getTeamRosterPlayers(teamId)
    .filter((p) => positions.includes(String(p.pos ?? "").toUpperCase()))
    .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0];
  return String(top?.fullName ?? `${teamId} Starter`);
}

function topNames(teamId: string, positions: string[], count = 2) {
  const picks = getTeamRosterPlayers(teamId)
    .filter((p) => positions.includes(String(p.pos ?? "").toUpperCase()))
    .sort((a, b) => Number(b.overall ?? 0) - Number(a.overall ?? 0))
    .slice(0, count)
    .map((p, idx) => String(p?.fullName ?? `${teamId} ${idx === 0 ? "Starter" : "Backup"}`));

  while (picks.length < count) picks.push(`${teamId} ${picks.length === 0 ? "Starter" : "Backup"}`);
  return picks;
}

export function simulateAIGame(homeTeamId: string, awayTeamId: string, seed: number, week: number): AIGameResult {
  const rand = mulberry32(seed ^ hashMatchup({ homeTeamId, awayTeamId }));
  const homeRating = teamStrength(homeTeamId);
  const awayRating = teamStrength(awayTeamId);
  const spread = (homeRating - awayRating) * 0.6;
  const homeScore = Math.max(6, Math.round(24 + spread + gaussian(rand) * 8));
  const awayScore = Math.max(3, Math.round(22 - spread + gaussian(rand) * 8));

  const homePassingYards = Math.max(120, Math.round(220 + (homeRating - 70) * 4 + gaussian(rand) * 30));
  const awayPassingYards = Math.max(120, Math.round(220 + (awayRating - 70) * 4 + gaussian(rand) * 30));
  const homeRushingYards = Math.max(55, Math.round(95 + (homeRating - 70) * 2 + gaussian(rand) * 22));
  const awayRushingYards = Math.max(55, Math.round(95 + (awayRating - 70) * 2 + gaussian(rand) * 22));

  const homeRusher = topName(homeTeamId, ["RB", "HB"]);
  const awayRusher = topName(awayTeamId, ["RB", "HB"]);
  const homeQB = topName(homeTeamId, ["QB"]);
  const awayQB = topName(awayTeamId, ["QB"]);
  const homeWR = topName(homeTeamId, ["WR", "TE"]);
  const awayWR = topName(awayTeamId, ["WR", "TE"]);
  const homeEdge = topName(homeTeamId, ["EDGE", "DE", "DL"]);
  const awayEdge = topName(awayTeamId, ["EDGE", "DE", "DL"]);

  const homePassHeadline = rand() > 0.5;
  const awayPassHeadline = rand() > 0.5;

  return {
    gameId: `${week}:${homeTeamId}:${awayTeamId}`,
    week,
    homeTeamId,
    awayTeamId,
    homeScore,
    awayScore,
    homePassingYards,
    awayPassingYards,
    homeRushingYards,
    awayRushingYards,
    homeHeadline: homePassHeadline ? { playerName: homeQB, type: "PASS", value: Math.round(homePassingYards * 0.65) } : { playerName: homeRusher, type: "RUSH", value: Math.round(homeRushingYards * 0.68) },
    awayHeadline: awayPassHeadline ? { playerName: awayQB, type: "PASS", value: Math.round(awayPassingYards * 0.65) } : { playerName: awayRusher, type: "RUSH", value: Math.round(awayRushingYards * 0.68) },
    homeReceivingLeader: { playerName: homeWR, value: Math.round(homePassingYards * 0.35) },
    awayReceivingLeader: { playerName: awayWR, value: Math.round(awayPassingYards * 0.35) },
    homeSackLeader: { playerName: homeEdge, value: Number((0.5 + rand() * 1.8).toFixed(1)) },
    awaySackLeader: { playerName: awayEdge, value: Number((0.5 + rand() * 1.8).toFixed(1)) },
  };
}

export function computeLeagueStatLeaders(results: AIGameResult[]): LeagueStatLeaders {
  const pass = new Map<string, { playerName: string; teamId: string; value: number }>();
  const rush = new Map<string, { playerName: string; teamId: string; value: number }>();
  const recv = new Map<string, { playerName: string; teamId: string; value: number }>();
  const sacks = new Map<string, { playerName: string; teamId: string; value: number }>();

  const add = (map: Map<string, { playerName: string; teamId: string; value: number }>, key: string, row: { playerName: string; teamId: string; value: number }) => {
    const cur = map.get(key);
    map.set(key, { ...row, value: Number((row.value + Number(cur?.value ?? 0)).toFixed(1)) });
  };

  const addTeamYards = (
    teamId: string,
    passingYards: number,
    rushingYards: number,
    receivingLeader: { playerName: string; value: number },
    sackLeader: { playerName: string; value: number },
  ) => {
    const [qb1, qb2] = topNames(teamId, ["QB"]);
    const [rb1, rb2] = topNames(teamId, ["RB", "HB"]);
    const [wr1, wr2] = topNames(teamId, ["WR", "TE"]);

    add(pass, `${qb1}:${teamId}`, { playerName: qb1, teamId, value: Math.round(passingYards * 0.65) });
    add(pass, `${qb2}:${teamId}`, { playerName: qb2, teamId, value: Math.round(passingYards * 0.25) });

    add(rush, `${rb1}:${teamId}:r`, { playerName: rb1, teamId, value: Math.round(rushingYards * 0.65) });
    add(rush, `${rb2}:${teamId}:r`, { playerName: rb2, teamId, value: Math.round(rushingYards * 0.25) });

    add(recv, `${receivingLeader.playerName}:${teamId}`, { playerName: receivingLeader.playerName || wr1, teamId, value: Math.round(passingYards * 0.65) });
    add(recv, `${wr2}:${teamId}`, { playerName: wr2, teamId, value: Math.round(passingYards * 0.25) });
    add(sacks, `${sackLeader.playerName}:${teamId}`, { playerName: sackLeader.playerName, teamId, value: sackLeader.value });
  };

  for (const g of results) {
    addTeamYards(g.homeTeamId, g.homePassingYards, g.homeRushingYards, g.homeReceivingLeader, g.homeSackLeader);
    addTeamYards(g.awayTeamId, g.awayPassingYards, g.awayRushingYards, g.awayReceivingLeader, g.awaySackLeader);
  }

  const top = (map: Map<string, { playerName: string; teamId: string; value: number }>) => Array.from(map.values()).sort((a, b) => b.value - a.value).slice(0, 5);
  return { passingYards: top(pass), rushingYards: top(rush), receivingYards: top(recv), sacks: top(sacks) };
}

export function simulateWeek(params: {
  schedule: LeagueSchedule;
  gameType: GameType;
  week: number;
  userHomeTeamId: string;
  userAwayTeamId: string;
  userScore?: { homeScore: number; awayScore: number };
  seed: number;
  previousStandings: TeamStanding[];
  priorWeekResults: WeekResult[];
}): WeekResult {
  const { schedule, gameType, week, userHomeTeamId, userAwayTeamId, userScore, seed, previousStandings, priorWeekResults } = params;
  const ws = gameType === "PRESEASON" ? schedule.preseasonWeeks.find((w) => w.week === week) : schedule.regularSeasonWeeks.find((w) => w.week === week);
  if (!ws) return { week, userGameId: "", allGameResults: [], updatedStandings: previousStandings, statLeaders: computeLeagueStatLeaders(priorWeekResults.flatMap((r) => r.allGameResults)) };

  const allGameResults: AIGameResult[] = ws.matchups.map((m) => {
    const isUserGame =
      (m.homeTeamId === userHomeTeamId && m.awayTeamId === userAwayTeamId) ||
      (m.homeTeamId === userAwayTeamId && m.awayTeamId === userHomeTeamId);

    if (isUserGame && userScore) {
      const ai = simulateAIGame(m.homeTeamId, m.awayTeamId, seed + week * 97, week);
      return { ...ai, homeScore: userScore.homeScore, awayScore: userScore.awayScore };
    }
    const sim = simulateAIGame(m.homeTeamId, m.awayTeamId, seed + hashMatchup(m) + week * 997, week);
    return sim;
  });

  const updatedStandings = computeStandings(allGameResults, previousStandings);
  const seasonResults = [...priorWeekResults.flatMap((r) => r.allGameResults), ...allGameResults];
  const statLeaders = computeLeagueStatLeaders(seasonResults);
  const userGame = allGameResults.find((g) => (g.homeTeamId === userHomeTeamId && g.awayTeamId === userAwayTeamId) || (g.homeTeamId === userAwayTeamId && g.awayTeamId === userHomeTeamId));

  return { week, userGameId: userGame?.gameId ?? "", allGameResults, updatedStandings, statLeaders };
}

export function standingsToRecord(standings: TeamStanding[]): Record<string, TeamStandingRecord> {
  const out: Record<string, TeamStandingRecord> = {};
  for (const s of standings) out[s.teamId] = { w: s.wins, l: s.losses, pf: s.pointsFor, pa: s.pointsAgainst };
  return out;
}

export function initTeamStandings(teamIds: string[]): TeamStanding[] {
  return teamIds.map((teamId) => {
    const t = getTeamById(teamId);
    return {
      teamId,
      teamName: t?.name ?? teamId,
      division: String(t?.divisionId ?? ""),
      conference: String(t?.conferenceId ?? ""),
      wins: 0,
      losses: 0,
      ties: 0,
      winPct: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      divisionRecord: { w: 0, l: 0, t: 0 },
      streak: "-",
      lastFive: [],
    };
  });
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

  const standings = { ...params.league.standings };
  const newResults: WeekResultRecord[] = [];

  for (const m of ws.matchups) {
    const isUserGame =
      (m.homeTeamId === userHomeTeamId && m.awayTeamId === userAwayTeamId) ||
      (m.homeTeamId === userAwayTeamId && m.awayTeamId === userHomeTeamId);

    const scores = isUserGame
      ? userScore
      : simulateFullGame({ homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, seed: seed + hashMatchup(m) + week * 997 });

    const r: WeekResultRecord = { gameType, week, homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId, ...scores };
    applyResult(standings, r);
    newResults.push(r);
  }

  return {
    standings,
    results: [...params.league.results, ...newResults],
    gmByTeamId: params.league.gmByTeamId,
    postseason: params.league.postseason,
    week: week + 1,
    tradeDeadlineWeek: params.league.tradeDeadlineWeek ?? TRADE_DEADLINE_DEFAULT_WEEK,
  };
}
