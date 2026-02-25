import { describe, expect, it } from "vitest";
import { COMBINE_DAY_COUNT, COMBINE_DEFAULT_INTERVIEW_TOKENS } from "@/engine/scouting/combineConstants";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";

function initCombineState(): GameState {
  let state = migrateSave({}) as GameState;
  state = gameReducer(state, { type: "SCOUT_INIT" });
  state = gameReducer(state, { type: "SCOUT_COMBINE_GENERATE" });
  return state;
}

describe("combine reducer token/day behavior", () => {
  it("uses exactly four combine days", () => {
    const state = initCombineState();
    expect(COMBINE_DAY_COUNT).toBe(4);
    expect(Object.keys(state.scoutingState?.combine.days ?? {})).toHaveLength(4);
  });

  it("resets day token budget to 10", () => {
    let state = initCombineState();
    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";
    expect(prospectId).toBeTruthy();

    state = gameReducer(state, { type: "SCOUT_COMBINE_SET_DAY", payload: { day: 4 } });
    state = gameReducer(state, { type: "SCOUT_COMBINE_INTERVIEW", payload: { prospectId, category: "IQ" } });
    expect(state.scoutingState?.combine.days[4].interviewsRemaining).toBe(COMBINE_DEFAULT_INTERVIEW_TOKENS - 1);

    state = gameReducer(state, { type: "SCOUT_COMBINE_SET_DAY", payload: { day: 3 } });
    state = gameReducer(state, { type: "SCOUT_COMBINE_SET_DAY", payload: { day: 4 } });
    expect(state.scoutingState?.combine.days[4].interviewsRemaining).toBe(COMBINE_DEFAULT_INTERVIEW_TOKENS);
  });

  it("does not carry over unused tokens between days", () => {
    let state = initCombineState();
    const [firstProspect = ""] = Object.keys(state.scoutingState?.scoutProfiles ?? {});

    state = gameReducer(state, { type: "SCOUT_COMBINE_SET_DAY", payload: { day: 4 } });
    state = gameReducer(state, { type: "SCOUT_COMBINE_INTERVIEW", payload: { prospectId: firstProspect, category: "LEADERSHIP" } });
    expect(state.scoutingState?.combine.days[4].interviewsRemaining).toBe(COMBINE_DEFAULT_INTERVIEW_TOKENS - 1);

    state = gameReducer(state, { type: "SCOUT_COMBINE_SET_DAY", payload: { day: 2 } });
    expect(state.scoutingState?.combine.days[2].interviewsRemaining).toBe(COMBINE_DEFAULT_INTERVIEW_TOKENS);
  });
});
