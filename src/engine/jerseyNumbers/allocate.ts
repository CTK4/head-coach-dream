import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { allowedRangesByGroup, preferredOrderByGroup, type PositionGroup } from "@/engine/jerseyNumbers/rules";
import { getJerseyNumberForPlayer, inRanges } from "@/engine/jerseyNumbers/utils";

export const JERSEY_NO_AVAILABLE_NUMBER = "JERSEY_NO_AVAILABLE_NUMBER";

export function allocateJerseyNumber(args: {
  state: GameState;
  teamId: string;
  playerId: string;
  posGroup: PositionGroup;
  requestedNumber?: number;
}): number {
  const { state, teamId, playerId, posGroup, requestedNumber } = args;
  const allowedRanges = allowedRangesByGroup[posGroup];
  const roster = getEffectivePlayersByTeam(state, teamId);
  const isTakenByOther = (n: number) =>
    roster.some((p: any) => String(p.playerId) !== String(playerId) && Number(p.jerseyNumber) === n);
  const isTaken = (n: number) => roster.some((p: any) => Number(p.jerseyNumber) === n);

  const current = getJerseyNumberForPlayer(state, playerId);
  if (current != null && inRanges(current, allowedRanges) && !isTakenByOther(current)) {
    return current;
  }

  if (requestedNumber != null && inRanges(requestedNumber, allowedRanges) && !isTaken(requestedNumber)) {
    return requestedNumber;
  }

  for (const candidate of preferredOrderByGroup[posGroup]) {
    if (!isTaken(candidate)) return candidate;
  }

  throw new Error(JERSEY_NO_AVAILABLE_NUMBER);
}
