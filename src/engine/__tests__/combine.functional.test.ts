import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";
import { getScoutViewProspect } from "@/engine/scouting/scoutView";

describe("combine functionality", () => {
  it("generates combine results and scout view hides true OVR", () => {
    let state = createInitialStateForTests();
    state = gameReducer(state, { type: "COMBINE_RUN_EVENTS", payload: { seed: 42 } });
    const results = state.offseasonData.combine.resultsByProspectId ?? {};
    expect(Object.keys(results).length).toBeGreaterThan(0);

    const firstId = Object.keys(results)[0];
    const view = getScoutViewProspect(state, firstId);
    expect(JSON.stringify(view)).not.toContain("trueOVR");
  });
});
