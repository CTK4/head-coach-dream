import type { GameState } from "@/context/GameContext";
import { generateDraftClass } from "@/engine/draftClass/generateDraftClass";
import { initDraftSim } from "@/engine/draftSim";

type InitialDraftArgs = { season: number; saveSeed: number; userTeamId: string };

export function createInitialDraftState({ season, saveSeed, userTeamId }: InitialDraftArgs): GameState["draft"] {
  return {
    started: false,
    completed: false,
    totalRounds: 7,
    currentOverall: 1,
    orderTeamIds: [],
    leaguePicks: [],
    onClockTeamId: undefined,
    withdrawnBoardIds: {},
    prospectPool: generateDraftClass({ year: season, count: 224, leagueSeed: saveSeed, saveSlotId: 0 }),
    appliedSelectionCount: 0,
    ...initDraftSim({ saveSeed, season, userTeamId }),
    rosterCountsByTeamBucket: {},
    draftedCountsByTeamBucket: {},
  };
}
