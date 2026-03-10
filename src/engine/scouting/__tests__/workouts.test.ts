import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";

describe("private workouts", () => {
  it("successful workout bumps projection band", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";
    const beforeLow = state.scoutingState?.scoutProfiles[prospectId]?.estLow ?? 0;

    state = gameReducer(state, { type: "SCOUT_CONDUCT_WORKOUT", payload: { prospectId } });

    const result = state.scoutingState?.workouts.resultsByProspectId?.[prospectId];
    const afterLow = state.scoutingState?.scoutProfiles[prospectId]?.estLow ?? 0;
    expect(result).toBeTruthy();
    expect(Object.keys(result?.drills ?? {}).length).toBeGreaterThan(0);
    expect(afterLow).toBeGreaterThanOrEqual(beforeLow);
  });

  it("reducer updates all scouting submodules", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";

    state = gameReducer(state, { type: "SCOUT_RUN_INTERVIEW", payload: { prospectId, category: "INTELLIGENCE" } });
    state = gameReducer(state, { type: "SCOUT_REQUEST_MEDICAL", payload: { prospectId } });
    state = gameReducer(state, { type: "SCOUT_CONDUCT_WORKOUT", payload: { prospectId } });

    expect(state.scoutingState?.interviews.resultsByProspectId?.[prospectId]?.length).toBeGreaterThan(0);
    expect(state.scoutingState?.medical.resultsByProspectId?.[prospectId]).toBeTruthy();
    expect(state.scoutingState?.workouts.resultsByProspectId?.[prospectId]).toBeTruthy();
  });
});
