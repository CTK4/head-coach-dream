import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";

describe("INIT_FREE_PLAY_CAREER", () => {
  it("initializes hub-ready free play state with deterministic career stage", () => {
    const seeded = gameReducer({} as GameState, {
      type: "INIT_NEW_GAME_FROM_STORY",
      payload: {
        offer: {
          teamId: "ATLANTA_APEX",
          years: 4,
          salary: 4_000_000,
          autonomy: 65,
          patience: 55,
          mediaNarrativeKey: "story_start",
          base: { years: 4, salary: 4_000_000, autonomy: 65 },
        },
        teamName: "Apex",
      },
    });

    const next = gameReducer(seeded, {
      type: "INIT_FREE_PLAY_CAREER",
      payload: {
        teamId: "MILWAUKEE_NORTHSHORE",
        teamName: "Northshore",
      },
    });

    expect(next.phase).toBe("HUB");
    expect(next.careerStage).toBe("RESIGN");
    expect(next.acceptedOffer?.teamId).toBe("MILWAUKEE_NORTHSHORE");
    expect(next.teamId).toBe("MILWAUKEE_NORTHSHORE");
    expect(next.hub.regularSeasonWeek).toBe(1);
  });
});
