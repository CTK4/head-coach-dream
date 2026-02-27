import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";

describe("playbooks + combine wiring", () => {
  it("updates offense/defense playbook ids via state action", () => {
    let state = migrateSave({}) as GameState;
    state = gameReducer(state, { type: "SET_PLAYBOOK", payload: { side: "OFFENSE", playbookId: "AIR_RAID" } });
    state = gameReducer(state, { type: "SET_PLAYBOOK", payload: { side: "DEFENSE", playbookId: "TAMPA_2" } });

    expect(state.playbooks.offensePlaybookId).toBe("AIR_RAID");
    expect(state.playbooks.defensePlaybookId).toBe("TAMPA_2");
  });

  it("selects and runs combine interviews deterministically", () => {
    let state = migrateSave({ saveSeed: 12345, teamId: "CHI", userTeamId: "CHI" }) as GameState;
    state = gameReducer(state, { type: "SCOUT_INIT" });

    const ids = Object.keys(state.scoutingState?.scoutProfiles ?? {}).slice(0, 10);
    for (const id of ids) {
      state = gameReducer(state, { type: "SCOUT_COMBINE_SELECT", payload: { prospectId: id, category: "IQ" } });
    }
    state = gameReducer(state, { type: "SCOUT_COMBINE_RUN_INTERVIEWS", payload: { category: "IQ" } });

    const day = state.scoutingState?.combine.day ?? 1;
    expect(state.scoutingState?.combine.selectedByDay[day].IQ).toHaveLength(10);

    const firstRun = ids.map((id) => state.scoutingState?.combine.interviewResultsByProspectId[id]?.intelligencePct);

    let state2 = migrateSave({ saveSeed: 12345, teamId: "CHI", userTeamId: "CHI" }) as GameState;
    state2 = gameReducer(state2, { type: "SCOUT_INIT" });
    for (const id of ids) {
      state2 = gameReducer(state2, { type: "SCOUT_COMBINE_SELECT", payload: { prospectId: id, category: "IQ" } });
    }
    state2 = gameReducer(state2, { type: "SCOUT_COMBINE_RUN_INTERVIEWS", payload: { category: "IQ" } });
    const secondRun = ids.map((id) => state2.scoutingState?.combine.interviewResultsByProspectId[id]?.intelligencePct);

    expect(firstRun).toEqual(secondRun);
  });
});
