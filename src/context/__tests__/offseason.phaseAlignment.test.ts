import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { OffseasonStepEnum } from "@/lib/stateMachine";

function initState(): GameState {
  const seeded = gameReducer({} as GameState, {
    type: "INIT_NEW_GAME_FROM_STORY",
    payload: {
      offer: { teamId: "MILWAUKEE_NORTHSHORE", years: 4, salary: 4_000_000, autonomy: 65, patience: 55, mediaNarrativeKey: "story_start", base: { years: 4, salary: 4_000_000, autonomy: 65 } },
      teamName: "Test Team",
    },
  });
  return gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId: "MILWAUKEE_NORTHSHORE", teamName: "Test Team" } });
}

describe("offseason phase alignment", () => {
  it("save migration aligns FREE_AGENCY step to FA stage", () => {
    const base = initState();
    const migrated = migrateSave({ ...base, careerStage: undefined, league: { ...base.league, phase: "OFFSEASON" }, offseason: { ...base.offseason, stepId: OffseasonStepEnum.FREE_AGENCY } }) as GameState;
    expect(migrated.offseason.stepId).toBe("FREE_AGENCY");
    expect(migrated.careerStage).toBe("FREE_AGENCY");
  });

  it("phase completion advances to PRE_DRAFT", () => {
    const base = initState();
    const inFa = gameReducer({ ...base, careerStage: "FREE_AGENCY", offseason: { ...base.offseason, stepId: "FREE_AGENCY" as any, stepsComplete: { ...base.offseason.stepsComplete, FREE_AGENCY: true } }, freeAgency: { ...base.freeAgency, status: "ready", offersByPlayerId: {} } }, { type: "FA_COMPLETE_PHASE" } as any);
    expect(inFa.offseason.stepId).toBe("PRE_DRAFT");
  });
});
