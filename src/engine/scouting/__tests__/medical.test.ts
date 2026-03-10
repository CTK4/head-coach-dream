import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";

describe("scouting medical", () => {
  it("red/black medical flag lowers estHigh", () => {
    let state = gameReducer(createInitialStateForTests(), { type: "SCOUT_INIT" });
    const profiles = state.scoutingState?.trueProfiles ?? {};
    const riskyId = Object.keys(profiles).find((id) => {
      const tier = profiles[id]?.trueMedical?.tier;
      return tier === "RED" || tier === "BLACK";
    });
    expect(riskyId).toBeTruthy();
    if (!riskyId) return;

    const before = state.scoutingState?.scoutProfiles[riskyId]?.estHigh ?? 0;
    state = gameReducer(state, { type: "SCOUT_REQUEST_MEDICAL", payload: { prospectId: riskyId } });
    const after = state.scoutingState?.scoutProfiles[riskyId]?.estHigh ?? 0;

    expect(after).toBeLessThan(before);
  });
});
