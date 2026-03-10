import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";

describe("scouting interviews", () => {
  it("reveals trait or boosts confidence", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";
    const before = state.scoutingState?.scoutProfiles[prospectId];

    state = gameReducer(state, { type: "SCOUT_RUN_INTERVIEW", payload: { prospectId, category: "CHARACTER" } });

    const result = state.scoutingState?.interviews.resultsByProspectId?.[prospectId]?.[0];
    const after = state.scoutingState?.scoutProfiles[prospectId];
    expect(result).toBeTruthy();
    expect((after?.confidence ?? 0) >= (before?.confidence ?? 0)).toBe(true);
    expect(Boolean(result?.reveal) || (after?.confidence ?? 0) > (before?.confidence ?? 0)).toBe(true);
  });
});
