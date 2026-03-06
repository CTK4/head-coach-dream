import type { PlayType, Possession } from "@/engine/gameSim";

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
