import type { GameAction, GameState } from "@/context/GameContext";
import { draftReducer } from "@/context/draftReducer";
import { freeAgencyReducer } from "@/context/freeAgencyReducer";
import { offseasonReducer } from "@/context/offseasonReducer";
import { seasonReducer } from "@/context/seasonReducer";

export type DomainReducerCompatDeps = {
  reduceOffseason: (state: GameState, action: GameAction) => GameState;
  reduceDraft: (state: GameState, action: GameAction) => GameState;
  reduceSeasonGameplay: (state: GameState, action: GameAction) => GameState;
  reduceContracts: (state: GameState, action: GameAction) => GameState;
};

export const defaultDomainReducerCompatDeps: DomainReducerCompatDeps = {
  reduceOffseason: (state, action) => offseasonReducer(state, action),
  reduceDraft: (state, action) => draftReducer(state, action),
  reduceSeasonGameplay: (state, action) => seasonReducer(state, action),
  reduceContracts: (state, action) => freeAgencyReducer(state, action),
};
