import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";

function initDraft(): GameState {
  let state = migrateSave({}) as GameState;
  state = gameReducer(state, { type: "DRAFT_INIT" });

  const onClock = state.draft.slots[state.draft.cursor];
  state = { ...state, draft: { ...state.draft, userTeamId: onClock?.teamId ?? state.draft.userTeamId } };

  state = { ...state, uiToast: "" as any };
  return state;
}

describe("draft prospect id source fix", () => {
  it("DRAFT_INIT produces PROSPECT ids instead of numeric ids", () => {
    const state = initDraft();

    expect(state.draft.prospectPool.length).toBeGreaterThan(0);
    for (const prospect of state.draft.prospectPool.slice(0, 10)) {
      expect(prospect.prospectId).toMatch(/^PROSPECT_/);
      expect(Number.isNaN(Number(prospect.prospectId))).toBe(true);
    }
  });

  it("DRAFT_USER_PICK succeeds when using an id from the current pool", () => {
    let state = initDraft();
    const target = state.draft.prospectPool.find((p) => !state.draft.takenProspectIds[p.prospectId]);

    expect(target).toBeDefined();
    state = gameReducer(state, { type: "DRAFT_USER_PICK", payload: { prospectId: target!.prospectId } });

    expect(state.uiToast).not.toBe("Prospect not found");
    expect(state.draft.selections.some((s) => s.prospectId === target!.prospectId)).toBe(true);
  });

  it("creates a rookie record after a successful user pick", () => {
    let state = initDraft();
    const rookiesBefore = (state.rookies ?? []).length;
    const target = state.draft.prospectPool.find((p) => !state.draft.takenProspectIds[p.prospectId]);

    expect(target).toBeDefined();
    state = gameReducer(state, { type: "DRAFT_USER_PICK", payload: { prospectId: target!.prospectId } });

    expect((state.rookies ?? []).length).toBeGreaterThan(rookiesBefore);
    expect((state.rookies ?? []).some((r) => r.prospectId === target!.prospectId)).toBe(true);
  });

  it("blocks duplicate picks of the same prospect id", () => {
    let state = initDraft();
    const target = state.draft.prospectPool.find((p) => !state.draft.takenProspectIds[p.prospectId]);

    expect(target).toBeDefined();
    state = gameReducer(state, { type: "DRAFT_USER_PICK", payload: { prospectId: target!.prospectId } });

    const slot = state.draft.slots[state.draft.cursor];
    state = { ...state, draft: { ...state.draft, userTeamId: slot?.teamId ?? state.draft.userTeamId } };

    state = gameReducer(state, { type: "DRAFT_USER_PICK", payload: { prospectId: target!.prospectId } });

    expect(state.draft.selections.filter((s) => s.prospectId === target!.prospectId)).toHaveLength(1);
  });
});
