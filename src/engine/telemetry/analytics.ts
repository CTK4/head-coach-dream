import type { SeasonAggV1 } from "@/engine/telemetry/types";

export type TeamTelemetrySnapshot = {
  teamId: string;
  games: number;
  passYards: number;
  rushYards: number;
  season: number;
};

export function buildCareerLeaderboards(params: {
  currentSeason: number;
  currentSeasonAgg?: SeasonAggV1;
  historicalBySeason?: Record<number, Partial<SeasonAggV1>>;
}): TeamTelemetrySnapshot[] {
  const rows: TeamTelemetrySnapshot[] = [];

  const pushSeason = (season: number, seasonAgg?: Partial<SeasonAggV1>) => {
    for (const [teamId, teamAgg] of Object.entries(seasonAgg?.byTeamId ?? {})) {
      rows.push({
        teamId,
        season,
        games: Number(teamAgg?.games ?? 0),
        passYards: Number(teamAgg?.totals?.passYards ?? 0),
        rushYards: Number(teamAgg?.totals?.rushYards ?? 0),
      });
    }
  };

  for (const [seasonKey, seasonAgg] of Object.entries(params.historicalBySeason ?? {})) {
    pushSeason(Number(seasonKey), seasonAgg);
  }
  pushSeason(Number(params.currentSeason), params.currentSeasonAgg);

  const byTeamId: Record<string, TeamTelemetrySnapshot> = {};
  for (const row of rows) {
    const cur = byTeamId[row.teamId] ?? { teamId: row.teamId, games: 0, passYards: 0, rushYards: 0, season: row.season };
    byTeamId[row.teamId] = {
      ...cur,
      games: cur.games + row.games,
      passYards: cur.passYards + row.passYards,
      rushYards: cur.rushYards + row.rushYards,
      season: Math.max(cur.season, row.season),
    };
  }

  return Object.values(byTeamId).sort((a, b) => {
    if (b.passYards !== a.passYards) return b.passYards - a.passYards;
    return b.rushYards - a.rushYards;
  });
}
