import type { GameType } from "@/engine/schedule";
import type { GameAggV1, PlayEventV1Minimal, TeamGameAggV1 } from "@/engine/telemetry/types";

const PASS_PLAY_TYPES = new Set(["QUICK_GAME", "DROPBACK", "SCREEN", "SHORT_PASS", "DEEP_PASS", "PLAY_ACTION"]);
const RUN_PLAY_TYPES = new Set(["INSIDE_ZONE", "OUTSIDE_ZONE", "POWER", "RUN", "RPO_READ", "QB_KEEP"]);

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

function parseYards(result: string): number {
  const match = /for\s+(-?\d+)y/i.exec(result);
  return Number(match?.[1] ?? 0);
}

function isCompletion(result: string): boolean {
  return /complete for\s+-?\d+y/i.test(result);
}

function isSack(result: string): boolean {
  return /sack/i.test(result);
}

function isInterception(result: string): boolean {
  return /intercepted/i.test(result);
}

export function buildGameAggFromPlayLog(params: {
  season: number;
  weekType: GameType;
  weekNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  playLog: PlayEventV1Minimal[];
}): GameAggV1 {
  const { season, weekType, weekNumber, homeTeamId, awayTeamId, playLog } = params;
  const byTeamId: Record<string, TeamGameAggV1> = {
    [homeTeamId]: zeroTeamGameAgg(),
    [awayTeamId]: zeroTeamGameAgg(),
  };

  for (const play of playLog) {
    const teamId = play.possession === "HOME" ? homeTeamId : awayTeamId;
    const stats = byTeamId[teamId] ?? zeroTeamGameAgg();
    const result = String(play.result ?? "");
    const playType = String(play.playType);

    if (PASS_PLAY_TYPES.has(playType)) {
      stats.passAttempts += 1;
      if (isCompletion(result)) {
        stats.completions += 1;
        stats.passYards += Math.max(0, parseYards(result));
      }
      if (isSack(result)) stats.sacksTaken += 1;
      if (isInterception(result)) stats.interceptions += 1;
    }

    if (RUN_PLAY_TYPES.has(playType)) {
      stats.rushAttempts += 1;
      const yards = parseYards(result);
      stats.rushYards += Math.max(0, yards);
    }

    byTeamId[teamId] = stats;
  }

  return {
    version: 1,
    season,
    weekType,
    weekNumber,
    homeTeamId,
    awayTeamId,
    byTeamId,
  };
}
