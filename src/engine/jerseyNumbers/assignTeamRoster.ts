import type { GameState } from "@/context/GameContext";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { allocateJerseyNumber } from "@/engine/jerseyNumbers/allocate";
import { getPositionGroupForPlayer } from "@/engine/jerseyNumbers/utils";
import type { PositionGroup } from "@/engine/jerseyNumbers/rules";

const GROUP_PRIORITY: Record<PositionGroup, number> = {
  QB: 0,
  RB: 1,
  WR: 2,
  TE: 3,
  OL: 4,
  DL: 5,
  LB: 6,
  DB: 7,
  K: 8,
  P: 9,
};

export function assignTeamRosterNumbers(state: GameState, teamId: string): Record<string, number> {
  const roster = getEffectivePlayersByTeam(state, teamId)
    .map((p: any) => ({ playerId: String(p.playerId), posGroup: getPositionGroupForPlayer(p) }))
    .sort((a, b) => {
      const byGroup = GROUP_PRIORITY[a.posGroup] - GROUP_PRIORITY[b.posGroup];
      if (byGroup !== 0) return byGroup;
      return a.playerId.localeCompare(b.playerId);
    });

  const assigned: Record<string, number> = {};
  let workingState = state;

  for (const player of roster) {
    const number = allocateJerseyNumber({
      state: workingState,
      teamId,
      playerId: player.playerId,
      posGroup: player.posGroup,
    });
    assigned[player.playerId] = number;
    workingState = {
      ...workingState,
      playerAttrOverrides: {
        ...workingState.playerAttrOverrides,
        [player.playerId]: {
          ...(workingState.playerAttrOverrides?.[player.playerId] ?? {}),
          jerseyNumber: number,
        },
      },
    };
  }

  return assigned;
}
