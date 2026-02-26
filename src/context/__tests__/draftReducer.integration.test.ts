import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";

function initDraftState(): GameState {
  let state = migrateSave({}) as GameState;
  state = gameReducer(state, { type: "DRAFT_INIT" });
  return state;
}

describe("draft reducer integration", () => {
  it("applying a pick assigns rookie to roster and removes prospect from pool", () => {
    let state = initDraftState();
    const onClock = state.draft.slots[state.draft.cursor];
    state = { ...state, draft: { ...state.draft, userTeamId: onClock.teamId } };
    const targetProspectId = state.draft.prospectPool[0].prospectId;

    state = gameReducer(state, { type: "DRAFT_USER_PICK", payload: { prospectId: targetProspectId } });

    expect(state.rookies.some((r) => r.prospectId === targetProspectId)).toBe(true);
    expect(state.draft.prospectPool.some((p) => p.prospectId === targetProspectId)).toBe(false);
  });

  it("finalize clears old pool and creates deterministic next class", () => {
    const state = initDraftState();
    const before = state.upcomingDraftClass;
    const completeState: GameState = { ...state, draft: { ...state.draft, complete: true } } as GameState;
    const finalized = gameReducer(completeState, { type: "DRAFT_FINALIZE" });

    expect(finalized.draft.prospectPool).toHaveLength(0);
    expect(finalized.upcomingDraftClass).not.toEqual(before);

    const finalized2 = gameReducer(completeState, { type: "DRAFT_FINALIZE" });
    expect(finalized.upcomingDraftClass).toEqual(finalized2.upcomingDraftClass);
  });
});
