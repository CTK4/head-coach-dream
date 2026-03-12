import type { GameState } from "@/context/GameContext";
import { getPlayerById } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { JERSEY_NO_AVAILABLE_NUMBER } from "@/engine/jerseyNumbers/allocate";
import { allowedRangesByGroup, preferredOrderByGroup } from "@/engine/jerseyNumbers/rules";
import { getPositionGroupForPlayer } from "@/engine/jerseyNumbers/utils";
import { inRanges } from "@/engine/jerseyNumbers/utils";
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
    .map((p: any) => {
      const playerId = String(p.playerId);
      const jerseyNumber = Number(p.jerseyNumber);
      const baseTeamId = String(getPlayerById(playerId)?.teamId ?? "");
      return {
        playerId,
        posGroup: getPositionGroupForPlayer(p),
        requestedNumber: Number.isInteger(jerseyNumber) && jerseyNumber > 0 ? jerseyNumber : undefined,
        isIncumbentOnTeam: baseTeamId === String(teamId),
      };
    })
    .sort((a, b) => {
      if (a.isIncumbentOnTeam !== b.isIncumbentOnTeam) return a.isIncumbentOnTeam ? -1 : 1;
      const byGroup = GROUP_PRIORITY[a.posGroup] - GROUP_PRIORITY[b.posGroup];
      if (byGroup !== 0) return byGroup;
      return a.playerId.localeCompare(b.playerId);
    });

  const assigned: Record<string, number> = {};
  const used = new Set<number>();

  for (const player of roster) {
    const allowedRanges = allowedRangesByGroup[player.posGroup];
    const requested = player.requestedNumber;
    let number: number | undefined;

    if (requested != null && inRanges(requested, allowedRanges) && !used.has(requested)) {
      number = requested;
    } else {
      number = preferredOrderByGroup[player.posGroup].find((candidate) => !used.has(candidate));
    }
    if (number == null) throw new Error(JERSEY_NO_AVAILABLE_NUMBER);

    used.add(number);
    assigned[player.playerId] = number;
  }

  return assigned;
}
