import type { GameState } from "@/context/GameContext";
import { getEffectivePlayer, getEffectivePlayersByTeam, normalizePos } from "@/engine/rosterOverlay";
import type { NumberRange } from "@/engine/jerseyNumbers/validateRules";
import type { PositionGroup } from "@/engine/jerseyNumbers/rules";

export function inRanges(n: number, ranges: NumberRange[]): boolean {
  return ranges.some(([min, max]) => n >= min && n <= max);
}

export function expandRanges(ranges: NumberRange[]): number[] {
  const out: number[] = [];
  for (const [min, max] of ranges) {
    for (let n = min; n <= max; n++) out.push(n);
  }
  return out;
}

export function getUsedNumbersForTeam(state: GameState, teamId: string): Set<number> {
  const used = new Set<number>();
  for (const player of getEffectivePlayersByTeam(state, teamId)) {
    const jerseyNumber = Number((player as any).jerseyNumber);
    if (Number.isInteger(jerseyNumber) && jerseyNumber > 0) used.add(jerseyNumber);
  }
  return used;
}

export function getJerseyNumberForPlayer(state: GameState, playerId: string): number | undefined {
  const player = getEffectivePlayer(state, String(playerId));
  const jerseyNumber = Number((player as any)?.jerseyNumber);
  return Number.isInteger(jerseyNumber) && jerseyNumber > 0 ? jerseyNumber : undefined;
}

export function getPositionGroupForPlayer(player: { pos?: string }): PositionGroup {
  const pos = normalizePos(String(player.pos ?? "UNK"));
  if (pos === "QB") return "QB";
  if (pos === "RB" || pos === "FB" || pos === "HB") return "RB";
  if (pos === "WR") return "WR";
  if (pos === "TE") return "TE";
  if (pos === "OL") return "OL";
  if (pos === "DL" || pos === "EDGE") return "DL";
  if (pos === "LB") return "LB";
  if (pos === "CB" || pos === "S") return "DB";
  if (pos === "K") return "K";
  if (pos === "P") return "P";
  return "DB";
}
