import type { GameAggV1, SeasonAggRollingEntryV1, SeasonAggV1, TeamGameAggV1, TeamSeasonAggV1 } from "@/engine/telemetry/types";

function zeroTeamGameAgg(): TeamGameAggV1 {
  return {
    passAttempts: 0,
    completions: 0,
    passYards: 0,
    interceptions: 0,
    sacksTaken: 0,
    rushAttempts: 0,
    rushYards: 0,
  };
}

function zeroTeamSeasonAgg(): TeamSeasonAggV1 {
  return {
    games: 0,
    totals: zeroTeamGameAgg(),
    rollingLast4: [],
    rollingLast8: [],
  };
}

function toRollingEntry(gameKey: string, stats: TeamGameAggV1): SeasonAggRollingEntryV1 {
  return { gameKey, ...stats };
}

function mergeStats(a: TeamGameAggV1, b: TeamGameAggV1): TeamGameAggV1 {
  return {
    passAttempts: a.passAttempts + b.passAttempts,
    completions: a.completions + b.completions,
    passYards: a.passYards + b.passYards,
    interceptions: a.interceptions + b.interceptions,
    sacksTaken: a.sacksTaken + b.sacksTaken,
    rushAttempts: a.rushAttempts + b.rushAttempts,
    rushYards: a.rushYards + b.rushYards,
  };
}

export function applyGameAggToSeasonAgg(params: { seasonAgg?: SeasonAggV1; gameAgg: GameAggV1; gameKey: string }): SeasonAggV1 {
  const { gameAgg, gameKey } = params;
  const seasonAgg: SeasonAggV1 = params.seasonAgg ?? { version: 1, appliedGameKeys: {}, byTeamId: {} };
  if (seasonAgg.appliedGameKeys[gameKey]) return seasonAgg;

  const nextByTeamId = { ...seasonAgg.byTeamId };
  for (const [teamId, gameStats] of Object.entries(gameAgg.byTeamId)) {
    const prev = nextByTeamId[teamId] ?? zeroTeamSeasonAgg();
    const entry = toRollingEntry(gameKey, gameStats);
    nextByTeamId[teamId] = {
      games: prev.games + 1,
      totals: mergeStats(prev.totals, gameStats),
      rollingLast4: [...prev.rollingLast4, entry].slice(-4),
      rollingLast8: [...prev.rollingLast8, entry].slice(-8),
    };
  }

  return {
    version: 1,
    byTeamId: nextByTeamId,
    appliedGameKeys: { ...seasonAgg.appliedGameKeys, [gameKey]: true },
  };
}
