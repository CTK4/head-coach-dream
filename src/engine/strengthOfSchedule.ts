import type { LeagueState, WeekResult } from "@/engine/leagueSim";

export type NormalizedGame = { homeId: string; awayId: string; homeScore: number; awayScore: number };
export type WL = { w: number; l: number };

function asGame(result: WeekResult): NormalizedGame | null {
  const homeId = String((result as any).homeTeamId ?? (result as any).teamAId ?? "").trim();
  const awayId = String((result as any).awayTeamId ?? (result as any).teamBId ?? "").trim();
  const homeScore = Number((result as any).homeScore);
  const awayScore = Number((result as any).awayScore);

  if (!homeId || !awayId || !Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return null;
  return { homeId, awayId, homeScore, awayScore };
}

export function normalizeGames(league: LeagueState): NormalizedGame[] {
  return (league.results ?? []).map(asGame).filter((game): game is NormalizedGame => game !== null);
}

export function computeOpponentsByTeamId(league: LeagueState): Record<string, string[]> {
  const opponentsByTeamId: Record<string, string[]> = {};
  for (const teamId of Object.keys(league.standings ?? {})) opponentsByTeamId[teamId] = [];

  for (const game of normalizeGames(league)) {
    opponentsByTeamId[game.homeId] = [...(opponentsByTeamId[game.homeId] ?? []), game.awayId];
    opponentsByTeamId[game.awayId] = [...(opponentsByTeamId[game.awayId] ?? []), game.homeId];
  }

  return opponentsByTeamId;
}

export function computeStrengthOfSchedule(
  league: LeagueState,
  teamId: string,
  opponentsByTeamId: Record<string, string[]> = computeOpponentsByTeamId(league)
): number {
  const opponents = opponentsByTeamId[teamId] ?? [];
  if (opponents.length === 0) return 0.5;

  const opponentWinPcts = opponents.map((opponentId) => {
    const standing = league.standings[opponentId];
    if (!standing) return 0;
    const games = standing.w + standing.l;
    return games === 0 ? 0 : standing.w / games;
  });

  return opponentWinPcts.reduce((sum, value) => sum + value, 0) / opponentWinPcts.length;
}

export function computeRecordsFromGames(games: NormalizedGame[]): Record<string, WL> {
  const records: Record<string, WL> = {};
  for (const game of games) {
    if (!records[game.homeId]) records[game.homeId] = { w: 0, l: 0 };
    if (!records[game.awayId]) records[game.awayId] = { w: 0, l: 0 };

    if (game.homeScore > game.awayScore) {
      records[game.homeId].w += 1;
      records[game.awayId].l += 1;
    } else if (game.awayScore > game.homeScore) {
      records[game.awayId].w += 1;
      records[game.homeId].l += 1;
    }
  }
  return records;
}

export function computeHeadToHeadWL(games: NormalizedGame[], teamId: string, opponentId: string): { team: WL; opponent: WL } {
  const team: WL = { w: 0, l: 0 };
  const opponent: WL = { w: 0, l: 0 };

  for (const game of games) {
    const isH2H =
      (game.homeId === teamId && game.awayId === opponentId) ||
      (game.homeId === opponentId && game.awayId === teamId);
    if (!isH2H) continue;

    const teamScore = game.homeId === teamId ? game.homeScore : game.awayScore;
    const oppScore = game.homeId === opponentId ? game.homeScore : game.awayScore;

    if (teamScore > oppScore) {
      team.w += 1;
      opponent.l += 1;
    } else if (oppScore > teamScore) {
      opponent.w += 1;
      team.l += 1;
    }
  }

  return { team, opponent };
}

export function computeOpponentWinPctExcludingTeam(games: NormalizedGame[], opponentId: string, teamId: string): number {
  const allRecords = computeRecordsFromGames(games);
  const full = allRecords[opponentId] ?? { w: 0, l: 0 };
  const h2h = computeHeadToHeadWL(games, teamId, opponentId);

  const w = Math.max(0, full.w - h2h.opponent.w);
  const l = Math.max(0, full.l - h2h.opponent.l);
  const total = w + l;
  return total === 0 ? 0 : w / total;
}

/**
 * NFL-style SOS using opponent win% with games vs teamId removed.
 * Falls back to neutral 0.5 when no opponents are available.
 */
export function computeStrengthOfScheduleNFL(league: LeagueState, teamId: string): number {
  const games = normalizeGames(league);
  const opponentsByTeamId = computeOpponentsByTeamId(league);
  const opponents = Array.from(new Set(opponentsByTeamId[teamId] ?? []));
  if (opponents.length === 0) return 0.5;
  if (games.length === 0) return computeStrengthOfSchedule(league, teamId, opponentsByTeamId);

  const values = opponents.map((opponentId) => computeOpponentWinPctExcludingTeam(games, opponentId, teamId));
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
