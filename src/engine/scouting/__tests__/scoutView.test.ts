import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getScoutViewProspect } from "@/engine/scouting/scoutView";

describe("getScoutViewProspect", () => {
  it("hides true ratings and returns estimated range", () => {
    let state = migrateSave({}) as GameState;
    state = gameReducer(state, { type: "SCOUT_INIT" });
    const id = Object.keys(state.scoutingState?.scoutProfiles ?? {})[0];
    const view = getScoutViewProspect(state, id);
    expect(view).toBeTruthy();
    expect(JSON.stringify(view)).not.toContain("trueOVR");
    expect(view?.estOverallRange[0]).toBeLessThanOrEqual(view?.estOverallRange[1] ?? 0);
  });
});
