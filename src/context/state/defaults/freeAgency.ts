import type { GameState } from "@/context/GameContext";

export function createInitialFreeAgencyState(): GameState["freeAgency"] {
  return {
    status: "idle",
    initStatus: "idle",
    isResolving: false,
    progress: undefined,
    lastResolveWeekKey: undefined,
    ui: { mode: "NONE" },
    offersByPlayerId: {},
    signingsByPlayerId: {},
    nextOfferSeq: 1,
    bootstrappedFromTampering: false,
    resolvesUsedThisPhase: 0,
    maxResolvesPerPhase: 5,
    activity: [],
    draftByPlayerId: {},
    boardPlayerIds: [],
    marketApyByPlayerId: {},
    initializedForSeason: undefined,
    lastResolvedTick: undefined,
    error: undefined,
    resolveRoundByPlayerId: {},
    pendingCounterTeamByPlayerId: {},
    cpuTickedOnOpen: false,
  };
}
