import type { PlayType, Possession } from "@/engine/gameSim";
import type { GameType } from "@/engine/schedule";

export type PlayEventV1Minimal = {
  version: 1;
  playIndex: number;
  drive: number;
  playInDrive: number;
  quarter: 1 | 2 | 3 | 4 | "OT";
  clockSec: number;
  possession: Possession;
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballOn: number;
  playType: PlayType;
  result: string;
  homeScore: number;
  awayScore: number;
};

export type TeamGameAggV1 = {
  passAttempts: number;
  completions: number;
  passYards: number;
  interceptions: number;
  sacksTaken: number;
  rushAttempts: number;
  rushYards: number;
};

export type GameAggV1 = {
  version: 1;
  season: number;
  weekType: GameType;
  weekNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  byTeamId: Record<string, TeamGameAggV1>;
};

export type SeasonAggRollingEntryV1 = {
  gameKey: string;
  passAttempts: number;
  completions: number;
  passYards: number;
  interceptions: number;
  sacksTaken: number;
  rushAttempts: number;
  rushYards: number;
};

export type TeamSeasonAggV1 = {
  games: number;
  totals: TeamGameAggV1;
  rollingLast4: SeasonAggRollingEntryV1[];
  rollingLast8: SeasonAggRollingEntryV1[];
};

export type SeasonAggV1 = {
  version: 1;
  appliedGameKeys: Record<string, true>;
  byTeamId: Record<string, TeamSeasonAggV1>;
};

export type DerivedMetricFn = (stats: TeamGameAggV1) => number;
