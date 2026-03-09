import type { GameState } from "@/context/GameContext";

export function createInitialFreeAgencyState(): GameState["freeAgency"] {
  return {
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
    resolveRoundByPlayerId: {},
    pendingCounterTeamByPlayerId: {},
    cpuTickedOnOpen: false,
  };
}
