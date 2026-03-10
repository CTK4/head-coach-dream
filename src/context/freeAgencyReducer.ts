import { gameReducerMonolith, type GameAction, type GameState } from "@/context/GameContext";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";
import { computeCapLedger } from "@/engine/capLedger";
import { projectedMarketApy } from "@/engine/marketModel";

const LEGACY_FREE_AGENCY_ACTIONS = new Set<GameAction["type"]>([
  "FA_INIT_OFFERS",
  "FA_INIT_START",
  "FA_INIT_READY",
  "FA_INIT_ERROR",
  "FA_INIT_RESET",
  "FA_REJECT",
  "FA_WITHDRAW",
  "FA_SIGN",
  "FA_OPEN_PLAYER",
  "FA_OPEN_MY_OFFERS",
  "FA_CLOSE_MODAL",
  "FA_BOOTSTRAP_FROM_TAMPERING",
  "FA_SET_DRAFT",
  "FA_SUBMIT_OFFER",
  "FA_UPDATE_USER_OFFER",
  "FA_CLEAR_USER_OFFER",
  "FA_RESPOND_COUNTER",
  "FA_CPU_TICK",
  "INIT_FREE_AGENCY_MARKET",
  "RESOLVE_FREE_AGENCY_WEEK",
  "FA_SET_RESOLVING",
  "FA_RESOLVE",
  "FA_RESOLVE_BATCH",
  "FA_WITHDRAW_OFFER",
  "FA_RESOLVE_WEEK",
  "FA_ACCEPT_OFFER",
  "FA_REJECT_OFFER",
]);

function defaultOfferFromPlayer(player: any): { years: number; apy: number } {
  const years = Number(player?.age ?? 26) <= 27 ? 3 : 2;
  const apy = Math.max(750_000, Math.round(projectedMarketApy(String(player?.pos ?? "UNK"), Number(player?.overall ?? 60), Number(player?.age ?? 26)) / 50_000) * 50_000);
  return { years, apy };
}

function userTeamId(state: GameState): string {
  return String(state.acceptedOffer?.teamId ?? state.userTeamId ?? "");
}

function isLiveUserOffer(offer: { isUser: boolean; teamId: string; status: string }, userTid: string): boolean {
  return offer.isUser && String(offer.teamId) === userTid && (offer.status === "PENDING" || offer.status === "COUNTERED");
}


/**
 * Temporary stabilizer: cap-filter pending/countered offers in a deterministic player-first order
 * (approximate resolve order) to prevent single-tick cap double-spend.
 */
function withCapFilteredPendingOffers(state: GameState): GameState {
  const offersByPlayerId = { ...state.freeAgency.offersByPlayerId };
  const remainingByTeamId: Record<string, number> = {};
  const userTid = userTeamId(state);

  const getRemaining = (teamId: string): number => {
    const tid = String(teamId);
    if (remainingByTeamId[tid] == null) {
      remainingByTeamId[tid] = Math.max(0, Number(computeCapLedger(state, tid).capSpace ?? (tid === userTid ? state.finances.capSpace : 0)));
    }
    return remainingByTeamId[tid];
  };

  const reserve = (teamId: string, amount: number) => {
    const tid = String(teamId);
    remainingByTeamId[tid] = Math.max(0, getRemaining(tid) - Math.max(0, Number(amount || 0)));
  };

  const players = getEffectiveFreeAgents(state)
    .map((p: any) => ({ playerId: String(p.playerId), ovr: Number(p.overall ?? 0) }))
    .sort((a, b) => b.ovr - a.ovr || a.playerId.localeCompare(b.playerId));

  const allowedOfferIds = new Set<string>();
  for (const { playerId } of players) {
    const offers = (offersByPlayerId[playerId] ?? [])
      .filter((offer) => offer.status === "PENDING" || offer.status === "COUNTERED")
      .sort((a, b) => Number(b.aav ?? 0) - Number(a.aav ?? 0) || Number(b.years ?? 0) - Number(a.years ?? 0) || a.offerId.localeCompare(b.offerId));

    for (const offer of offers) {
      const capNeed = Number(offer.aav ?? 0);
      if (getRemaining(offer.teamId) >= capNeed) {
        allowedOfferIds.add(offer.offerId);
        reserve(offer.teamId, capNeed);
      }
    }
  }

  let changed = false;
  for (const [playerId, offers] of Object.entries(offersByPlayerId)) {
    const nextOffers = offers.map((offer) => {
      if (offer.status !== "PENDING" && offer.status !== "COUNTERED") return offer;
      if (allowedOfferIds.has(offer.offerId)) return offer;
      changed = true;
      return { ...offer, status: "REJECTED" as const, decisionReason: "Invalid cap: team cannot absorb contract" };
    });
    offersByPlayerId[playerId] = nextOffers;
  }

  if (!changed) return state;
  return { ...state, freeAgency: { ...state.freeAgency, offersByPlayerId } };
}

export function freeAgencyReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "FA_ENTER_MARKET": {
      if (state.offseason?.stepId !== "FREE_AGENCY") return state;
      if (state.freeAgency.initializedForSeason === state.season && state.freeAgency.initStatus === "ready") return state;

      const pool = getEffectiveFreeAgents(state);
      const boardPlayerIds = pool.map((p: any) => String(p.playerId));
      const marketApyByPlayerId = Object.fromEntries(pool.map((p: any) => [String(p.playerId), defaultOfferFromPlayer(p)]));
      let next: GameState = {
        ...state,
        freeAgency: {
          ...state.freeAgency,
          status: "ready",
          initStatus: "ready",
          boardPlayerIds,
          marketApyByPlayerId,
          initializedForSeason: state.season,
          error: undefined,
          isResolving: false,
          offersByPlayerId: {},
          signingsByPlayerId: {},
          draftByPlayerId: {},
          activity: [],
          resolveRoundByPlayerId: {},
          pendingCounterTeamByPlayerId: {},
          resolvesUsedThisPhase: 0,
          cpuTickedOnOpen: false,
        },
      };
      next = gameReducerMonolith(next, { type: "SCOUTING_WINDOW_INIT", payload: { windowId: "FREE_AGENCY" } });
      next = gameReducerMonolith(next, { type: "FA_BOOTSTRAP_FROM_TAMPERING" });
      next = gameReducerMonolith(next, { type: "FA_CPU_TICK" });
      return next;
    }

    case "FA_CREATE_DRAFT": {
      const playerId = String(action.payload.playerId);
      if (state.freeAgency.draftByPlayerId[playerId]) return state;
      const fallbackPlayer = getEffectiveFreeAgents(state).find((p: any) => String(p.playerId) === playerId);
      const defaults = state.freeAgency.marketApyByPlayerId?.[playerId] ?? defaultOfferFromPlayer(fallbackPlayer);
      return gameReducerMonolith(state, { type: "FA_SET_DRAFT", payload: { playerId, years: defaults.years, aav: defaults.apy } });
    }

    case "FA_UPDATE_DRAFT": {
      const playerId = String(action.payload.playerId);
      const current = state.freeAgency.draftByPlayerId[playerId];
      if (!current) return state;
      const patch = action.payload.patch ?? {};
      const years = Math.max(1, Math.min(7, Number((patch as any).years ?? current.years)));
      const aav = Math.max(750_000, Math.round(Number((patch as any).apy ?? current.aav) / 50_000) * 50_000);
      return gameReducerMonolith(state, { type: "FA_SET_DRAFT", payload: { playerId, years, aav } });
    }

    case "FA_SUBMIT_USER_OFFER": {
      const playerId = String(action.payload.playerId);
      const userTid = userTeamId(state);
      const draft = state.freeAgency.draftByPlayerId[playerId];
      if (!userTid || !draft) return state;

      const existingForPlayer = state.freeAgency.offersByPlayerId[playerId] ?? [];
      const hasLiveOfferForPlayer = existingForPlayer.some((offer) => isLiveUserOffer(offer, userTid));
      if (hasLiveOfferForPlayer) {
        return { ...state, freeAgency: { ...state.freeAgency, error: undefined } };
      }

      const pendingUserCommitment = Object.values(state.freeAgency.offersByPlayerId ?? {})
        .flat()
        .filter((offer) => isLiveUserOffer(offer, userTid))
        .reduce((sum, offer) => sum + Math.max(0, Number(offer.aav ?? 0)), 0);

      const requested = Math.max(0, Number(draft.aav ?? 0));
      const capSpace = Math.max(0, Number(state.finances.capSpace ?? 0));
      if (pendingUserCommitment + requested > capSpace) {
        return {
          ...state,
          freeAgency: {
            ...state.freeAgency,
            error: "Insufficient cap space for this offer.",
          },
        };
      }

      return gameReducerMonolith({ ...state, freeAgency: { ...state.freeAgency, error: undefined } }, { type: "FA_SUBMIT_OFFER", payload: { playerId } });
    }

    case "FA_WITHDRAW_USER_OFFER": {
      const playerId = String(action.payload.playerId);
      const offerId = String(action.payload.offerId);
      return gameReducerMonolith(state, { type: "FA_WITHDRAW_OFFER", payload: { playerId, offerId } });
    }

    case "FA_ADVANCE_MARKET": {
      if (state.offseason?.stepId !== "FREE_AGENCY") return state;
      if (state.freeAgency.initStatus !== "ready") return state;

      const filtered = withCapFilteredPendingOffers(state);
      const resolving = { ...filtered, freeAgency: { ...filtered.freeAgency, status: "resolving", isResolving: true } };
      const resolved = gameReducerMonolith(resolving, { type: "FA_RESOLVE" });
      return {
        ...resolved,
        freeAgency: {
          ...resolved.freeAgency,
          status: "ready",
          isResolving: false,
          lastResolvedTick: Number(resolved.freeAgency.lastResolvedTick ?? 0) + 1,
        },
      };
    }

    case "FA_COMPLETE_PHASE": {
      const hasPending = Object.values(state.freeAgency.offersByPlayerId ?? {}).some((offers) => (offers ?? []).some((o) => o.status === "PENDING" || o.status === "COUNTERED"));
      if (hasPending) return { ...state, freeAgency: { ...state.freeAgency, error: "Resolve or withdraw pending offers before completing free agency." } };
      const completed = gameReducerMonolith(state, { type: "OFFSEASON_COMPLETE_STEP", payload: { stepId: "FREE_AGENCY" } });
      return gameReducerMonolith(completed, { type: "OFFSEASON_ADVANCE_STEP" });
    }

    default:
      if (LEGACY_FREE_AGENCY_ACTIONS.has(action.type)) {
        return gameReducerMonolith(state, action);
      }
      return gameReducerMonolith(state, action);
  }
}
