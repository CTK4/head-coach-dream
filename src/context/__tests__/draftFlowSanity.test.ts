import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { doesProspectExist } from "@/data/draftClass";

describe("draft flow sanity", () => {
  it("initial migrated draft board references valid prospect ids", () => {
    const state = migrateSave({}) as GameState;
    const firstIds = state.scoutingState?.myBoardOrder.slice(0, 10) ?? [];
    expect(firstIds.length).toBeGreaterThan(0);
    for (const id of firstIds) {
      expect(doesProspectExist(id)).toBe(true);
    }
  });

  it("marks offseason DRAFT step complete when draft is finalized as complete", () => {
    const base = migrateSave({}) as GameState;
    const completeDraft = { ...base, draft: { ...base.draft, complete: true } } as GameState;

    const next = gameReducer(completeDraft, { type: "DRAFT_FINALIZE" });

    expect(next.offseason.stepsComplete.DRAFT).toBe(true);
  });

});
