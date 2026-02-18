import type { LeagueState } from "@/engine/leagueSim";
import { playoffFinishRank } from "@/engine/postseasonOrder";
import { computeStrengthOfSchedule, computeStrengthOfScheduleNFL, normalizeGames } from "@/engine/strengthOfSchedule";
import { computeCommonGamesWinPct, computeSplitRecords, getTeamMeta, recordWinPct } from "@/engine/tiebreaks";

export type TeamStanding = { w: number; l: number; pf: number; pa: number };

export type DraftOrderInputs = {
  league: LeagueState;
  userTeamId: string;
  postseason?: {
    playoffFinishRankByTeamId: Record<string, number>;
  };
};

type TeamMetrics = {
  teamId: string;
  standing: TeamStanding;
  winPct: number;
  sos: number;
  pointDiff: number;
  pf: number;
  divisionWinPct: number | null;
  conferenceWinPct: number | null;
};

function getPlayoffFinishRankByTeamId(input: DraftOrderInputs): Record<string, number> {
  if (input.postseason) return input.postseason.playoffFinishRankByTeamId;

  const leaguePostseason = input.league.postseason?.resultsByTeamId ?? {};
  const playoffFinishRankByTeamId: Record<string, number> = {};
  for (const [teamId, result] of Object.entries(leaguePostseason)) {
    if (!result.madePlayoffs) continue;
    playoffFinishRankByTeamId[teamId] = playoffFinishRank(result);
  }
  return playoffFinishRankByTeamId;
}

function baseTeamComparator(league: LeagueState, metricsByTeamId: Record<string, TeamMetrics>) {
  const splits = computeSplitRecords(league);

  return (teamA: string, teamB: string): number => {
    const a = metricsByTeamId[teamA];
    const b = metricsByTeamId[teamB];

    if (a.winPct !== b.winPct) return a.winPct - b.winPct;
    if (a.sos !== b.sos) return a.sos - b.sos;

    const aMeta = getTeamMeta(teamA);
    const bMeta = getTeamMeta(teamB);
    const hasDivisionData = Boolean(aMeta?.division && bMeta?.division);
    if (hasDivisionData && a.divisionWinPct !== null && b.divisionWinPct !== null && a.divisionWinPct !== b.divisionWinPct) {
      return a.divisionWinPct - b.divisionWinPct;
    }

    const hasConferenceData = Boolean(aMeta?.conference && bMeta?.conference);
    if (hasConferenceData && a.conferenceWinPct !== null && b.conferenceWinPct !== null && a.conferenceWinPct !== b.conferenceWinPct) {
      return a.conferenceWinPct - b.conferenceWinPct;
    }

    const commonOpponents = new Set(
      (splits.opponentsByTeamId[teamA] ?? []).filter((opp) => (splits.opponentsByTeamId[teamB] ?? []).includes(opp))
    );
    if (commonOpponents.size > 0) {
      const aCommonWinPct = computeCommonGamesWinPct(league, teamA, commonOpponents);
      const bCommonWinPct = computeCommonGamesWinPct(league, teamB, commonOpponents);
      if (aCommonWinPct !== null && bCommonWinPct !== null && aCommonWinPct !== bCommonWinPct) {
        return aCommonWinPct - bCommonWinPct;
      }
    }

    if (a.pointDiff !== b.pointDiff) return a.pointDiff - b.pointDiff;
    if (a.pf !== b.pf) return a.pf - b.pf;
    return teamA.localeCompare(teamB);
  };
}

function computeMetricsByTeamId(league: LeagueState): Record<string, TeamMetrics> {
  const games = normalizeGames(league);
  const splits = computeSplitRecords(league);

  return Object.fromEntries(
    Object.entries(league.standings).map(([teamId, standing]) => {
      const gamesPlayed = standing.w + standing.l;
      const winPct = gamesPlayed === 0 ? 0 : standing.w / gamesPlayed;
      const sos = games.length > 0 ? computeStrengthOfScheduleNFL(league, teamId) : computeStrengthOfSchedule(league, teamId);
      const pointDiff = standing.pf - standing.pa;
      const divisionWinPct = recordWinPct(splits.division[teamId]);
      const conferenceWinPct = recordWinPct(splits.conference[teamId]);

      return [
        teamId,
        { teamId, standing, winPct, sos, pointDiff, pf: standing.pf, divisionWinPct, conferenceWinPct } satisfies TeamMetrics,
      ];
    })
  );
}

export function computeFirstRoundOrderTeamIds(input: DraftOrderInputs): string[] {
  const standingsTeamIds = Object.keys(input.league.standings ?? {});
  if (standingsTeamIds.length === 0) return [];

  const metricsByTeamId = computeMetricsByTeamId(input.league);
  const compareTeams = baseTeamComparator(input.league, metricsByTeamId);
  const playoffFinishRankByTeamId = getPlayoffFinishRankByTeamId(input);
  const playoffTeamIds = new Set(Object.keys(playoffFinishRankByTeamId));

  const nonPlayoffTeams = standingsTeamIds.filter((teamId) => !playoffTeamIds.has(teamId)).sort(compareTeams);
  const playoffTeams = standingsTeamIds
    .filter((teamId) => playoffTeamIds.has(teamId))
    .sort((a, b) => {
      const rankDiff = (playoffFinishRankByTeamId[a] ?? 0) - (playoffFinishRankByTeamId[b] ?? 0);
      if (rankDiff !== 0) return rankDiff;
      return compareTeams(a, b);
    });

  return [...nonPlayoffTeams, ...playoffTeams];
}

export function computeFirstRoundPickNumber(input: DraftOrderInputs): number | null {
  if (!input.userTeamId || !(input.userTeamId in input.league.standings)) return null;
  const order = computeFirstRoundOrderTeamIds(input);
  const index = order.indexOf(input.userTeamId);
  return index === -1 ? null : index + 1;
}

export function computeOverallPickNumber(league: LeagueState, teamId: string): number | null {
  return computeFirstRoundPickNumber({ league, userTeamId: teamId });
}
