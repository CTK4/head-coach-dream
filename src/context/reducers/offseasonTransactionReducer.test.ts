import { describe, expect, it, vi } from "vitest";
import { isOffseasonTransactionAction, offseasonTransactionReducer } from "@/context/reducers/offseasonTransactionReducer";
import type { GameAction, GameState } from "@/context/GameContext";

function createBaseState(): GameState {
  return {
    season: 2026,
    offseason: { stepId: "FREE_AGENCY", stepsComplete: {}, completed: {} },
    offseasonData: { resigning: { decisions: {} }, rosterAudit: { cutDesignations: {} }, tagCenter: {} },
    freeAgency: { resolvesUsedThisPhase: 0, maxResolvesPerPhase: 2 },
    acceptedOffer: { teamId: "A" },
    userTeamId: "A",
    teamId: "A",
    playerMorale: {},
    playerContractOverrides: {},
    franchiseTags: {},
  } as unknown as GameState;
}

function createDeps() {
  return {
    gameReducer: vi.fn((state: GameState) => ({ ...state, freeAgency: { ...state.freeAgency, resolvesUsedThisPhase: state.freeAgency.resolvesUsedThisPhase + 1 } })),
    applyCanonicalTx: vi.fn((state: GameState) => state),
    applyFinances: vi.fn((state: GameState) => state),
    pushNews: vi.fn((state: GameState) => state),
    buildCpuTeamContext: vi.fn(() => ({})),
    cpuResignPlayers: vi.fn(() => []),
    getAllTeamIds: vi.fn(() => ["A", "B"]),
    contractOverrideFromOffer: vi.fn(() => ({ startSeason: 2027, endSeason: 2028, salaries: [1], signingBonus: 0 })),
    hasPendingFreeAgencyOffers: vi.fn(() => false),
    expireRemainingFreeAgencyOffers: vi.fn((state: GameState) => state),
    buildResignOffer: vi.fn(() => ({ years: 2, apy: 2_000_000, guaranteesPct: 0.4, discountPct: 0, createdFrom: "RESIGN_SCREEN" as const })),
    sanitizeResignOffer: vi.fn((offer) => offer),
    resolveDeterministicResignSubmission: vi.fn((state: GameState) => state),
    isNewsworthyRecommit: vi.fn(() => false),
    applyFranchiseTag: vi.fn((state: GameState) => state),
    moneyRound: vi.fn((n: number) => n),
    expireExpiringContractsToFreeAgency: vi.fn((state: GameState) => state),
  };
}

describe("offseasonTransactionReducer", () => {
  it("identifies routed transaction/offseason actions", () => {
    expect(isOffseasonTransactionAction({ type: "RESIGN_MAKE_OFFER" } as GameAction)).toBe(true);
    expect(isOffseasonTransactionAction({ type: "SET_PHASE" } as GameAction)).toBe(false);
  });

  it("stores generated resign offer decision", () => {
    const state = createBaseState();
    const deps = createDeps();
    const next = offseasonTransactionReducer(state, { type: "RESIGN_MAKE_OFFER", payload: { playerId: "p1", createdFrom: "RESIGN_SCREEN" } } as GameAction, deps);
    expect(next?.offseasonData.resigning.decisions.p1?.action).toBe("RESIGN");
    expect(deps.buildResignOffer).toHaveBeenCalledWith(state, "p1", "RESIGN_SCREEN");
  });

  it("delegates resign submit to deterministic submission helper", () => {
    const state = createBaseState();
    const deps = createDeps();
    const result = { ...state, season: 2027 } as GameState;
    deps.resolveDeterministicResignSubmission.mockReturnValue(result);

    const next = offseasonTransactionReducer(
      state,
      { type: "RESIGN_SUBMIT_OFFER", payload: { playerId: "p1", offer: { years: 3, apy: 3_000_000, guaranteesPct: 0.5, discountPct: 0 } } } as GameAction,
      deps,
    );

    expect(deps.resolveDeterministicResignSubmission).toHaveBeenCalled();
    expect(next).toBe(result);
  });
});
