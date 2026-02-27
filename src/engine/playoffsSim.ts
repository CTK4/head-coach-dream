import { getTeamById } from "@/data/leagueDb";
import { simulateFullGame } from "@/engine/gameSim";
import type { LeagueState } from "@/engine/leagueSim";
import type { PlayoffGame, PlayoffRound, PlayoffsBracket, PlayoffsState, PostseasonState, PostseasonTeamResult } from "@/engine/postseason";

function fnv1a32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function sortIdsByStanding(league: LeagueState): string[] {
  return Object.keys(league.standings ?? {}).sort((a, b) => {
    const A = league.standings[a];
    const B = league.standings[b];
    if ((B?.w ?? 0) !== (A?.w ?? 0)) return (B?.w ?? 0) - (A?.w ?? 0);
    const dA = (A?.pf ?? 0) - (A?.pa ?? 0);
    const dB = (B?.pf ?? 0) - (B?.pa ?? 0);
    if (dB !== dA) return dB - dA;
    if ((B?.pf ?? 0) !== (A?.pf ?? 0)) return (B?.pf ?? 0) - (A?.pf ?? 0);
    return a.localeCompare(b);
  });
}

function mkGame(round: PlayoffRound, homeTeamId: string, awayTeamId: string, conferenceId?: string, idx = 1): PlayoffGame {
  return { gameId: `${round}:${conferenceId ?? "LEAGUE"}:${idx}:${homeTeamId}:${awayTeamId}`, round, homeTeamId, awayTeamId, conferenceId };
}

function nextRound(round: PlayoffRound): PlayoffRound {
  if (round === "WILD_CARD") return "DIVISIONAL";
  if (round === "DIVISIONAL") return "CONF_FINALS";
  return "SUPER_BOWL";
}

export function buildPlayoffBracket(params: { league: LeagueState; season: number }): PlayoffsState {
  const seeded = sortIdsByStanding(params.league);
  const confIds = Array.from(new Set(seeded.map((teamId) => getTeamById(teamId)?.conferenceId).filter(Boolean))) as string[];
  const conferences: PlayoffsBracket["conferences"] = {};

  for (const confId of confIds) {
    const seeds = seeded.filter((id) => getTeamById(id)?.conferenceId === confId).slice(0, 8);
    const gamesByRound: PlayoffsBracket["conferences"][string]["gamesByRound"] = {};

    if (seeds.length >= 8) {
      gamesByRound.WILD_CARD = [mkGame("WILD_CARD", seeds[1], seeds[6], confId, 1), mkGame("WILD_CARD", seeds[2], seeds[5], confId, 2), mkGame("WILD_CARD", seeds[3], seeds[4], confId, 3)];
    } else if (seeds.length >= 4) {
      gamesByRound.DIVISIONAL = [mkGame("DIVISIONAL", seeds[0], seeds[3], confId, 1), mkGame("DIVISIONAL", seeds[1], seeds[2], confId, 2)];
    } else if (seeds.length >= 2) {
      gamesByRound.CONF_FINALS = [mkGame("CONF_FINALS", seeds[0], seeds[1], confId, 1)];
    }

    conferences[confId] = { conferenceId: confId, seeds, gamesByRound };
  }

  const round: PlayoffRound = Object.values(conferences).some((c) => (c.gamesByRound.WILD_CARD?.length ?? 0) > 0)
    ? "WILD_CARD"
    : Object.values(conferences).some((c) => (c.gamesByRound.DIVISIONAL?.length ?? 0) > 0)
      ? "DIVISIONAL"
      : "CONF_FINALS";

  return { season: params.season, round, bracket: { conferences }, completedGames: {} };
}

function simulateGame(seed: number, game: PlayoffGame) {
  const h = fnv1a32(`${game.gameId}:${game.homeTeamId}:${game.awayTeamId}`);
  const result = simulateFullGame({ homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId, seed: seed ^ h });
  const winnerTeamId = result.homeScore >= result.awayScore ? game.homeTeamId : game.awayTeamId;
  return { homeScore: result.homeScore, awayScore: result.awayScore, winnerTeamId };
}

export function getPlayoffRoundGames(playoffs: PlayoffsState): PlayoffGame[] {
  if (playoffs.round === "SUPER_BOWL") return playoffs.bracket.superBowl ? [playoffs.bracket.superBowl] : [];
  const games: PlayoffGame[] = [];
  for (const conf of Object.values(playoffs.bracket.conferences)) {
    games.push(...(conf.gamesByRound[playoffs.round] ?? []));
  }
  return games;
}

export function simulateCpuPlayoffGamesForRound(params: { playoffs: PlayoffsState; userTeamId?: string; seed: number }) {
  const games = getPlayoffRoundGames(params.playoffs);
  const completedGames = { ...params.playoffs.completedGames };
  let pendingUserGame = params.playoffs.pendingUserGame;
  for (const game of games) {
    if (completedGames[game.gameId]) continue;
    if (params.userTeamId && (game.homeTeamId === params.userTeamId || game.awayTeamId === params.userTeamId)) {
      pendingUserGame = { round: params.playoffs.round, gameId: game.gameId, homeTeamId: game.homeTeamId, awayTeamId: game.awayTeamId };
      continue;
    }
    completedGames[game.gameId] = simulateGame(params.seed, game);
  }
  return { completedGames, pendingUserGame };
}

function winnersForRound(playoffs: PlayoffsState, round: PlayoffRound, conferenceId?: string): string[] {
  const games = round === "SUPER_BOWL"
    ? (playoffs.bracket.superBowl ? [playoffs.bracket.superBowl] : [])
    : (conferenceId ? playoffs.bracket.conferences[conferenceId]?.gamesByRound[round] ?? [] : getPlayoffRoundGames(playoffs));
  return games.map((g) => playoffs.completedGames[g.gameId]?.winnerTeamId).filter(Boolean) as string[];
}

export function advancePlayoffRound(playoffs: PlayoffsState): PlayoffsState {
  const currentGames = getPlayoffRoundGames(playoffs);
  if (!currentGames.length || currentGames.some((g) => !playoffs.completedGames[g.gameId])) return playoffs;
  if (playoffs.round === "SUPER_BOWL") return playoffs;

  const next = nextRound(playoffs.round);
  const bracket: PlayoffsBracket = { ...playoffs.bracket, conferences: { ...playoffs.bracket.conferences } };

  if (next === "SUPER_BOWL") {
    const confWinners = Object.keys(bracket.conferences).map((confId) => winnersForRound(playoffs, "CONF_FINALS", confId)[0]).filter(Boolean) as string[];
    if (confWinners.length >= 2) bracket.superBowl = mkGame("SUPER_BOWL", confWinners[0], confWinners[1], undefined, 1);
    return { ...playoffs, round: "SUPER_BOWL", bracket, pendingUserGame: undefined };
  }

  for (const confId of Object.keys(bracket.conferences)) {
    const conf = bracket.conferences[confId];
    const seeds = conf.seeds;
    const seedRank = Object.fromEntries(seeds.map((t, i) => [t, i + 1]));
    if (next === "DIVISIONAL") {
      const wcWinners = winnersForRound(playoffs, "WILD_CARD", confId);
      if (!wcWinners.length) continue;
      const lowest = wcWinners.slice().sort((a, b) => (seedRank[b] ?? 99) - (seedRank[a] ?? 99))[0];
      const other = wcWinners.filter((id) => id !== lowest)[0];
      const topSeed = seeds[0];
      const games = [mkGame("DIVISIONAL", topSeed, lowest, confId, 1)];
      if (other) games.push(mkGame("DIVISIONAL", wcWinners.find((id) => id !== lowest && id !== other) ?? other, other, confId, 2));
      conf.gamesByRound.DIVISIONAL = games;
    } else if (next === "CONF_FINALS") {
      const winners = winnersForRound(playoffs, "DIVISIONAL", confId);
      if (winners.length >= 2) conf.gamesByRound.CONF_FINALS = [mkGame("CONF_FINALS", winners[0], winners[1], confId, 1)];
      else if (winners.length === 1) conf.gamesByRound.CONF_FINALS = [mkGame("CONF_FINALS", winners[0], seeds[0] === winners[0] ? seeds[1] : seeds[0], confId, 1)];
    }
  }

  return { ...playoffs, round: next, bracket, pendingUserGame: undefined };
}

export function buildPostseasonResults(params: { league: LeagueState; playoffs: PlayoffsState }): { postseason: PostseasonState; championTeamId: string } {
  const resultsByTeamId: Record<string, PostseasonTeamResult> = {};
  const allStandingsTeams = Object.keys(params.league.standings ?? {});
  const playoffTeams = new Set(Object.values(params.playoffs.bracket.conferences).flatMap((c) => c.seeds));
  for (const id of allStandingsTeams) resultsByTeamId[id] = { teamId: id, madePlayoffs: playoffTeams.has(id) };

  for (const [gameId, final] of Object.entries(params.playoffs.completedGames)) {
    const [round, , , homeTeamId, awayTeamId] = gameId.split(":");
    const loser = final.winnerTeamId === homeTeamId ? awayTeamId : homeTeamId;
    resultsByTeamId[loser] = { teamId: loser, madePlayoffs: true, eliminatedIn: round as PlayoffRound };
  }

  const sb = params.playoffs.bracket.superBowl;
  const championTeamId = sb ? params.playoffs.completedGames[sb.gameId]?.winnerTeamId : Object.values(resultsByTeamId).find((r) => r.madePlayoffs)?.teamId ?? allStandingsTeams[0];
  if (championTeamId) resultsByTeamId[championTeamId] = { teamId: championTeamId, madePlayoffs: true, isChampion: true };
  return { postseason: { season: params.playoffs.season, resultsByTeamId }, championTeamId };
}

export function simulatePlayoffs(params: { league: LeagueState; season: number; seed: number }): { postseason: PostseasonState; championTeamId: string } {
  let playoffs = buildPlayoffBracket({ league: params.league, season: params.season });
  while (playoffs.round !== "SUPER_BOWL" || getPlayoffRoundGames(playoffs).some((g) => !playoffs.completedGames[g.gameId])) {
    const simmed = simulateCpuPlayoffGamesForRound({ playoffs, seed: params.seed });
    playoffs = { ...playoffs, completedGames: simmed.completedGames, pendingUserGame: undefined };
    if (playoffs.round === "SUPER_BOWL") break;
    playoffs = advancePlayoffRound(playoffs);
  }
  return buildPostseasonResults({ league: params.league, playoffs });
}
