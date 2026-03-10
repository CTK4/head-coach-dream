import type { LeagueState } from "@/engine/leagueSim";
import { playoffFinishRank } from "@/engine/postseasonOrder";
import { computeStrengthOfSchedule, computeStrengthOfScheduleNFL, normalizeGames } from "@/engine/strengthOfSchedule";
import { computeCommonGamesWinPct, computeSplitRecords, getTeamMeta, recordWinPct } from "@/engine/tiebreaks";

export type TeamStanding = { w: number; l: number; pf: number; pa: number };

export type DraftOrderEntry = {
  season: number;
  round: number;
  pick: number;
  teamId: string;
};

export type DraftOrderInputs = {
  league: LeagueState;
  userTeamId: string;
  season?: number;
  pickOwnerByKey?: Record<string, string>;
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

const DRAFT_ORDER_2026_R1: DraftOrderEntry[] = [
  { season: 2026, round: 1, pick: 1, teamId: "MILWAUKEE_NORTHSHORE" },
  { season: 2026, round: 1, pick: 2, teamId: "MEMPHIS_BLUES" },
  { season: 2026, round: 1, pick: 3, teamId: "ST._PETERSBURG_PELICANS" },
  { season: 2026, round: 1, pick: 4, teamId: "ORLANDO_KINGDOM" },
  { season: 2026, round: 1, pick: 5, teamId: "AUSTIN_EMPIRE" },
  { season: 2026, round: 1, pick: 6, teamId: "JACKSONVILLE_FLEET" },
  { season: 2026, round: 1, pick: 7, teamId: "BUFFALO_NORTHWIND" },
  { season: 2026, round: 1, pick: 8, teamId: "CLEVELAND_FORGE" },
  { season: 2026, round: 1, pick: 9, teamId: "INDIANAPOLIS_IGNITION" },
  { season: 2026, round: 1, pick: 10, teamId: "DETROIT_ASSEMBLY" },
  { season: 2026, round: 1, pick: 11, teamId: "BIRMINGHAM_VULCANS" },
  { season: 2026, round: 1, pick: 12, teamId: "NASHVILLE_SOUND" },
  { season: 2026, round: 1, pick: 13, teamId: "CHICAGO_UNION" },
  { season: 2026, round: 1, pick: 14, teamId: "CHARLOTTE_CROWN" },
  { season: 2026, round: 1, pick: 15, teamId: "BALTIMORE_ADMIRALS" },
  { season: 2026, round: 1, pick: 16, teamId: "HOUSTON_LAUNCH" },
  { season: 2026, round: 1, pick: 17, teamId: "PITTSBURGH_IRONCLADS" },
  { season: 2026, round: 1, pick: 18, teamId: "PHOENIX_SCORCH" },
  { season: 2026, round: 1, pick: 19, teamId: "MIAMI_TIDE" },
  { season: 2026, round: 1, pick: 20, teamId: "SEATTLE_EVERGREENS" },
  { season: 2026, round: 1, pick: 21, teamId: "LOS_ANGELES_STARS" },
  { season: 2026, round: 1, pick: 22, teamId: "DALLAS_IMPERIALS" },
  { season: 2026, round: 1, pick: 23, teamId: "NEW_ORLEANS_HEX" },
  { season: 2026, round: 1, pick: 24, teamId: "DENVER_SUMMIT" },
  { season: 2026, round: 1, pick: 25, teamId: "ATLANTA_APEX" },
  { season: 2026, round: 1, pick: 26, teamId: "LAS_VEGAS_SYNDICATE" },
  { season: 2026, round: 1, pick: 27, teamId: "NEW_YORK_GOTHIC_GUARDIANS" },
  { season: 2026, round: 1, pick: 28, teamId: "ST._LOUIS_ARCHONS" },
  { season: 2026, round: 1, pick: 29, teamId: "WASHINGTON_SENTINELS" },
  { season: 2026, round: 1, pick: 30, teamId: "SAN_DIEGO_ARMADA" },
  { season: 2026, round: 1, pick: 31, teamId: "PHILADELPHIA_FOUNDERS" },
  { season: 2026, round: 1, pick: 32, teamId: "BOSTON_HARBORMEN" },
];

function pickKey(season: number, round: number, pick: number) {
  return `S${season}-R${round}-P${pick}`;
}

function getPickOwnerTeamId(
  input: DraftOrderInputs,
  season: number,
  round: number,
  pick: number,
  originalTeamId: string
): string {
  const key = pickKey(season, round, pick);
  const fromInput = input.pickOwnerByKey?.[key];
  if (fromInput) return String(fromInput);

  const fromLeague = (input.league as any)?.draftPickOwnerByKey?.[key];
  if (fromLeague) return String(fromLeague);

  return originalTeamId;
}

export function getFixedDraftOrderIfAny(season: number, round: number): DraftOrderEntry[] | null {
  if (season === 2026 && round === 1) return DRAFT_ORDER_2026_R1;
  return null;
}

export function getFixedPickNumberIfAny(season: number, round: number, teamId: string): number | null {
  const fixed = getFixedDraftOrderIfAny(season, round);
  if (!fixed) return null;
  const row = fixed.find((x) => x.teamId === teamId);
  return row ? row.pick : null;
}

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
  const season = Number(input.season);
  const fixed = getFixedDraftOrderIfAny(season, 1);
  if (fixed) return fixed.map((entry) => entry.teamId);

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

export function computeUserOwnedFirstRoundPicks(input: DraftOrderInputs): number[] {
  const order = computeFirstRoundOrderTeamIds(input);
  if (!order.length) return [];

  const season = Number(input.season);
  if (!Number.isFinite(season)) {
    const index = order.indexOf(input.userTeamId);
    return index === -1 ? [] : [index + 1];
  }

  const picks: number[] = [];
  for (let i = 0; i < order.length; i += 1) {
    const pick = i + 1;
    const originalTeamId = order[i];
    const ownerTeamId = getPickOwnerTeamId(input, season, 1, pick, originalTeamId);
    if (String(ownerTeamId) === String(input.userTeamId)) picks.push(pick);
  }

  return picks;
}

export function computeFirstRoundPickNumber(input: DraftOrderInputs): number | null {
  if (!input.userTeamId) return null;
  const owned = computeUserOwnedFirstRoundPicks(input);
  return owned.length ? Math.min(...owned) : null;
}

export function computeTeamOnClock({
  league,
  season,
  round,
  pick,
}: {
  league: LeagueState;
  season: number;
  round: number;
  pick: number;
}): string | null {
  const fixed = getFixedDraftOrderIfAny(season, round);
  if (fixed) {
    const row = fixed.find((x) => x.pick === pick);
    return row ? row.teamId : null;
  }

  if (round !== 1) return null;
  const order = computeFirstRoundOrderTeamIds({ league, userTeamId: "", season });
  return order[pick - 1] ?? null;
}

export function computeOverallPickNumber(league: LeagueState, teamId: string): number | null {
  return computeFirstRoundPickNumber({ league, userTeamId: teamId });
}
