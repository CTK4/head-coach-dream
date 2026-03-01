import { describe, expect, it } from "vitest";
import { gameReducer, createInitialStateForTests, migrateSave, type GameState } from "@/context/GameContext";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";

describe("free agency pool", () => {
  it("stays populated after resign expiry pass and reload", { timeout: 20000 }, () => {
    let state = createInitialStateForTests();
    state = gameReducer(state, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId: "MILWAUKEE_NORTHSHORE", teamName: "Milwaukee", offer: { years: 4, salary: 4_000_000, autonomy: 70, patience: 60 } } });
    state = gameReducer(state, { type: "EXPIRE_EXPIRING_CONTRACTS_TO_FA", payload: { nextSeason: state.season + 1 } });

    expect(getEffectiveFreeAgents(state).length).toBeGreaterThan(0);
    const loaded = migrateSave(JSON.parse(JSON.stringify(state))) as GameState;
    expect(getEffectiveFreeAgents(loaded).length).toBeGreaterThan(0);
  });
});
