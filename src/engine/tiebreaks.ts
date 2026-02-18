import { getTeamById } from "@/data/leagueDb";
import type { LeagueState } from "@/engine/leagueSim";
import { normalizeGames } from "@/engine/strengthOfSchedule";

export function getTeamMeta(teamId: string): { conference?: string; division?: string } | null {
  const team = getTeamById(teamId);
  if (!team) return null;
  return { conference: team.conferenceId, division: team.divisionId };
}

type WL = { w: number; l: number };

function winPct(record?: WL): number | null {
  if (!record) return null;
  const total = record.w + record.l;
  return total === 0 ? null : record.w / total;
}

export function computeSplitRecords(league: LeagueState): {
  overall: Record<string, WL>;
  conference: Record<string, WL>;
  division: Record<string, WL>;
  opponentsByTeamId: Record<string, string[]>;
} {
  const overall: Record<string, WL> = {};
  const conference: Record<string, WL> = {};
  const division: Record<string, WL> = {};
  const opponentsByTeamId: Record<string, string[]> = {};

  for (const teamId of Object.keys(league.standings ?? {})) {
    overall[teamId] = { w: 0, l: 0 };
    conference[teamId] = { w: 0, l: 0 };
    division[teamId] = { w: 0, l: 0 };
    opponentsByTeamId[teamId] = [];
  }

  for (const game of normalizeGames(league)) {
    const { homeId, awayId, homeScore, awayScore } = game;
    opponentsByTeamId[homeId] = [...(opponentsByTeamId[homeId] ?? []), awayId];
    opponentsByTeamId[awayId] = [...(opponentsByTeamId[awayId] ?? []), homeId];

    if (!overall[homeId]) overall[homeId] = { w: 0, l: 0 };
    if (!overall[awayId]) overall[awayId] = { w: 0, l: 0 };
    if (!conference[homeId]) conference[homeId] = { w: 0, l: 0 };
    if (!conference[awayId]) conference[awayId] = { w: 0, l: 0 };
    if (!division[homeId]) division[homeId] = { w: 0, l: 0 };
    if (!division[awayId]) division[awayId] = { w: 0, l: 0 };

    const homeMeta = getTeamMeta(homeId);
    const awayMeta = getTeamMeta(awayId);

    let homeWon = false;
    let awayWon = false;
    if (homeScore > awayScore) homeWon = true;
    if (awayScore > homeScore) awayWon = true;

    if (homeWon) {
      overall[homeId].w += 1;
      overall[awayId].l += 1;
    }
    if (awayWon) {
      overall[awayId].w += 1;
      overall[homeId].l += 1;
    }

    const sameConference = homeMeta?.conference && awayMeta?.conference && homeMeta.conference === awayMeta.conference;
    if (sameConference) {
      if (homeWon) {
        conference[homeId].w += 1;
        conference[awayId].l += 1;
      }
      if (awayWon) {
        conference[awayId].w += 1;
        conference[homeId].l += 1;
      }
    }

    const sameDivision = homeMeta?.division && awayMeta?.division && homeMeta.division === awayMeta.division;
    if (sameDivision) {
      if (homeWon) {
        division[homeId].w += 1;
        division[awayId].l += 1;
      }
      if (awayWon) {
        division[awayId].w += 1;
        division[homeId].l += 1;
      }
    }
  }

  return { overall, conference, division, opponentsByTeamId };
}

export function computeCommonGamesWinPct(league: LeagueState, teamId: string, commonOpponentsSet: Set<string>): number | null {
  if (commonOpponentsSet.size === 0) return null;

  const games = normalizeGames(league);
  let w = 0;
  let l = 0;

  for (const game of games) {
    if (game.homeId !== teamId && game.awayId !== teamId) continue;
    const opponentId = game.homeId === teamId ? game.awayId : game.homeId;
    if (!commonOpponentsSet.has(opponentId)) continue;

    const teamScore = game.homeId === teamId ? game.homeScore : game.awayScore;
    const oppScore = game.homeId === opponentId ? game.homeScore : game.awayScore;
    if (teamScore > oppScore) w += 1;
    else if (oppScore > teamScore) l += 1;
  }

  const total = w + l;
  return total === 0 ? null : w / total;
}

export function recordWinPct(record?: WL): number | null {
  return winPct(record);
}
