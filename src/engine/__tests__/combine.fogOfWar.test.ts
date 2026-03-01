import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getScoutViewProspect } from "@/engine/scouting/scoutView";

describe("combine fog of war", () => {
  it("hides true OVR and persists interview results", () => {
    let state = migrateSave({ saveSeed: 42 }) as GameState;
    state = gameReducer(state, { type: "SCOUT_INIT" });
    state = gameReducer(state, { type: "SCOUT_COMBINE_GENERATE" });

    const prospectId = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0] ?? "";
    expect(prospectId).toBeTruthy();

    const view = getScoutViewProspect(state, prospectId);
    expect(JSON.stringify(view)).not.toContain("trueOVR");

    state = gameReducer(state, { type: "SCOUT_COMBINE_SELECT", payload: { prospectId, category: "IQ" } });
    state = gameReducer(state, { type: "SCOUT_COMBINE_RUN_INTERVIEWS", payload: { category: "IQ" } });

    const result = state.scoutingState?.combine.interviewResultsByProspectId?.[prospectId];
    expect(result).toBeTruthy();

    const loaded = migrateSave(JSON.parse(JSON.stringify(state))) as GameState;
    expect(loaded.scoutingState?.combine.interviewResultsByProspectId?.[prospectId]).toBeTruthy();
  });
});
