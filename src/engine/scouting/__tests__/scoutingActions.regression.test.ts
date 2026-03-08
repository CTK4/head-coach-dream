import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";

describe("scouting action regressions", () => {
  it("persists private workout results after dispatch", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";

    state = gameReducer(state, { type: "SCOUT_CONDUCT_WORKOUT", payload: { prospectId } });
    const workoutResult = state.scoutingState?.workouts.resultsByProspectId?.[prospectId];
    expect(workoutResult).toBeTruthy();

    const preserved = gameReducer(state, {
      type: "SCOUT_HYDRATE_MY_BOARD_ORDER",
      payload: { prospectIds: state.scoutingState?.myBoardOrder ?? [] },
    });
    expect(preserved.scoutingState?.workouts.resultsByProspectId?.[prospectId]).toEqual(workoutResult);
  });

  it("persists and accumulates interview results by prospect and category", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectIds = Object.keys(state.scoutingState?.scoutProfiles ?? {});
    const [firstProspectId = "", secondProspectId = ""] = prospectIds;

    state = gameReducer(state, { type: "SCOUT_RUN_INTERVIEW", payload: { prospectId: firstProspectId, category: "CHARACTER" } });
    state = gameReducer(state, { type: "SCOUT_RUN_INTERVIEW", payload: { prospectId: firstProspectId, category: "INTELLIGENCE" } });
    state = gameReducer(state, { type: "SCOUT_RUN_INTERVIEW", payload: { prospectId: secondProspectId, category: "CHARACTER" } });

    const firstResults = state.scoutingState?.interviews.resultsByProspectId?.[firstProspectId] ?? [];
    const secondResults = state.scoutingState?.interviews.resultsByProspectId?.[secondProspectId] ?? [];

    expect(firstResults).toHaveLength(2);
    expect(firstResults.map((result) => result.category)).toEqual(["CHARACTER", "INTELLIGENCE"]);
    expect(secondResults).toHaveLength(1);
    expect(secondResults[0]?.category).toBe("CHARACTER");
  });

  it("persists medical results and updates expected scouting record", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";
    const beforeHigh = state.scoutingState?.scoutProfiles[prospectId]?.estHigh ?? 0;

    state = gameReducer(state, { type: "SCOUT_REQUEST_MEDICAL", payload: { prospectId } });

    const medicalResult = state.scoutingState?.medical.resultsByProspectId?.[prospectId];
    const profile = state.scoutingState?.scoutProfiles[prospectId];
    const afterHigh = profile?.estHigh ?? 0;

    expect(medicalResult).toBeTruthy();
    expect(profile?.revealed.medicalTier).toBe(medicalResult?.riskTier);
    expect(profile?.notes.medical).toBe(medicalResult?.notes);
    if (medicalResult?.riskTier === "RED" || medicalResult?.riskTier === "BLACK") {
      expect(afterHigh).toBeLessThan(beforeHigh);
    } else {
      expect(afterHigh).toBe(beforeHigh);
    }
  });

  it("decrements scouting budget and remaining resources by action costs", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";
    const startRemaining = state.scoutingState?.budget.remaining ?? 0;
    const startSpent = state.scoutingState?.budget.spent ?? 0;

    state = gameReducer(state, { type: "SCOUT_RUN_INTERVIEW", payload: { prospectId, category: "CHARACTER" } });
    state = gameReducer(state, { type: "SCOUT_REQUEST_MEDICAL", payload: { prospectId } });
    state = gameReducer(state, { type: "SCOUT_CONDUCT_WORKOUT", payload: { prospectId } });

    expect(state.scoutingState?.budget.remaining).toBe(startRemaining - 9);
    expect(state.scoutingState?.budget.spent).toBe(startSpent + 9);
    expect(state.scoutingState?.carryover).toBe(state.scoutingState?.budget.remaining);
    expect(state.scoutingState?.interviews.interviewsRemaining).toBe(9);
    expect(state.scoutingState?.visits.privateWorkoutsRemaining).toBe(14);
  });
});
