import { describe, expect, it, vi } from "vitest";
import type { GameAction, GameState } from "@/context/GameContext";
import { reduceOffseasonDomain } from "@/context/domains/offseasonDomain";
import { reduceContractsDomain } from "@/context/domains/contractsDomain";
import { reduceRosterDomain } from "@/context/domains/rosterDomain";
import { reduceGameplayDomain } from "@/context/domains/gameplayDomain";
import { composeDomainReducers } from "@/context/domains/reducerDomains";
import { reduceWithPersistenceOrchestration } from "@/context/domains/persistenceOrchestration";

function stubState(): GameState {
  return {} as GameState;
}

function stubAction(type: string): GameAction {
  return { type } as GameAction;
}

describe("domain routing characterization", () => {
  it("routes offseason and draft actions to offseason/draft compatibility reducers", () => {
    const state = stubState();
    const action = stubAction("OFFSEASON_ADVANCE");
    const deps = {
      reduceOffseason: vi.fn(() => ({ lane: "offseason" } as unknown as GameState)),
      reduceDraft: vi.fn(() => ({ lane: "draft" } as unknown as GameState)),
      reduceSeasonGameplay: vi.fn(),
      reduceContracts: vi.fn(),
    };

    const next = reduceOffseasonDomain(state, action, deps);
    expect(next).toEqual({ lane: "offseason" });
    expect(deps.reduceOffseason).toHaveBeenCalledWith(state, action);

    const draftAction = stubAction("DRAFT_SELECT_PLAYER");
    const draftNext = reduceOffseasonDomain(state, draftAction, deps);
    expect(draftNext).toEqual({ lane: "draft" });
    expect(deps.reduceDraft).toHaveBeenCalledWith(state, draftAction);
  });

  it("routes contract and free agency actions to compatibility reducers", () => {
    const state = stubState();
    const deps = {
      reduceOffseason: vi.fn(() => ({ lane: "expiry" } as unknown as GameState)),
      reduceDraft: vi.fn(),
      reduceSeasonGameplay: vi.fn(),
      reduceContracts: vi.fn(() => ({ lane: "fa" } as unknown as GameState)),
    };

    expect(reduceContractsDomain(state, stubAction("EXPIRE_EXPIRING_CONTRACTS_TO_FA"), deps)).toEqual({ lane: "expiry" });
    expect(reduceContractsDomain(state, stubAction("FA_SUBMIT_OFFER"), deps)).toEqual({ lane: "fa" });
    expect(reduceContractsDomain(state, stubAction("FREE_AGENCY_ADVANCE"), deps)).toEqual({ lane: "fa" });
  });

  it("routes cut toggles to roster domain and season/playoff actions to gameplay", () => {
    const state = stubState();
    const rosterDeps = {
      reduceOffseason: vi.fn(() => ({ lane: "roster" } as unknown as GameState)),
    };
    expect(reduceRosterDomain(state, stubAction("CUT_TOGGLE"), rosterDeps)).toEqual({ lane: "roster" });

    const gameplayDeps = {
      reduceSeasonGameplay: vi.fn(() => ({ lane: "gameplay" } as unknown as GameState)),
    };
    expect(reduceGameplayDomain(state, stubAction("SEASON_ADVANCE_WEEK"), gameplayDeps)).toEqual({ lane: "gameplay" });
    expect(reduceGameplayDomain(state, stubAction("PLAYOFFS_ADVANCE_ROUND"), gameplayDeps)).toEqual({ lane: "gameplay" });
  });

  it("orchestrates phase-guard, domain reducers, and monolith fallback in order", () => {
    const state = stubState();
    const action = stubAction("ANY_ACTION");
    const blocked = { lane: "blocked" } as unknown as GameState;

    expect(reduceWithPersistenceOrchestration(state, action, {
      applyPhaseGuard: () => blocked,
      reduceDomainActions: [vi.fn(() => ({ lane: "domain" } as unknown as GameState))],
      reduceMonolith: vi.fn(() => ({ lane: "monolith" } as unknown as GameState)),
    })).toBe(blocked);

    const domainReducer = vi.fn(() => ({ lane: "domain" } as unknown as GameState));
    const monolithReducer = vi.fn(() => ({ lane: "monolith" } as unknown as GameState));
    expect(reduceWithPersistenceOrchestration(state, action, {
      applyPhaseGuard: () => null,
      reduceDomainActions: [domainReducer],
      reduceMonolith: monolithReducer,
    })).toEqual({ lane: "domain" });
    expect(monolithReducer).not.toHaveBeenCalled();

    expect(reduceWithPersistenceOrchestration(state, action, {
      applyPhaseGuard: () => null,
      reduceDomainActions: [vi.fn(() => null)],
      reduceMonolith: monolithReducer,
    })).toEqual({ lane: "monolith" });
  });

  it("composeDomainReducers returns first handled result", () => {
    const state = stubState();
    const action = stubAction("X");
    const first = vi.fn(() => null);
    const second = vi.fn(() => ({ lane: "second" } as unknown as GameState));
    const third = vi.fn(() => ({ lane: "third" } as unknown as GameState));

    expect(composeDomainReducers(state, action, [first, second, third])).toEqual({ lane: "second" });
    expect(third).not.toHaveBeenCalled();
  });
});
