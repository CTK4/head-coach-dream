import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { OffseasonStepEnum } from "@/lib/stateMachine";

function initState(teamId = "MILWAUKEE_NORTHSHORE"): GameState {
  const seeded = gameReducer({} as GameState, {
    type: "INIT_NEW_GAME_FROM_STORY",
    payload: {
      offer: {
        teamId,
        years: 4,
        salary: 4_000_000,
        autonomy: 65,
        patience: 55,
        mediaNarrativeKey: "story_start",
        base: { years: 4, salary: 4_000_000, autonomy: 65 },
      },
      teamName: "Test Team",
    },
  });
  return gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId, teamName: "Test Team" } });
}

describe("free agency lifecycle", () => {
  it("entering FREE_AGENCY initializes market once", () => {
    const base = initState();
    const atFa = gameReducer(
      {
        ...base,
        offseason: { ...base.offseason, stepId: OffseasonStepEnum.RESIGNING, stepsComplete: { ...base.offseason.stepsComplete, RESIGNING: true } },
        careerStage: "RESIGN",
      },
      { type: "OFFSEASON_ADVANCE_STEP" },
    );

    expect(atFa.offseason.stepId).toBe("FREE_AGENCY");
    expect(atFa.freeAgency.initStatus).toBe("ready");
    expect(atFa.freeAgency.initializedForSeason).toBe(atFa.season);
    expect(Array.isArray(atFa.freeAgency.boardPlayerIds)).toBe(true);
  });

  it("re-entering market after initialization is a no-op", () => {
    const base = initState();
    const inFa = gameReducer(
      { ...base, careerStage: "FREE_AGENCY", offseason: { ...base.offseason, stepId: OffseasonStepEnum.FREE_AGENCY } },
      { type: "FA_ENTER_MARKET" } as any,
    );

    const again = gameReducer(inFa, { type: "FA_ENTER_MARKET" } as any);

    expect(again.freeAgency.nextOfferSeq).toBe(inFa.freeAgency.nextOfferSeq);
    expect(again.freeAgency.offersByPlayerId).toEqual(inFa.freeAgency.offersByPlayerId);
    expect(again.freeAgency.activity).toEqual(inFa.freeAgency.activity);
  });

  it("FA_COMPLETE_PHASE only advances when no pending offers remain", () => {
    const base = initState();
    const blocked = gameReducer(
      {
        ...base,
        careerStage: "FREE_AGENCY",
        offseason: { ...base.offseason, stepId: OffseasonStepEnum.FREE_AGENCY, stepsComplete: { ...base.offseason.stepsComplete, FREE_AGENCY: true } },
        freeAgency: {
          ...base.freeAgency,
          initStatus: "ready",
          offersByPlayerId: {
            P_FA_1: [{ offerId: "O1", playerId: "P_FA_1", teamId: String(base.acceptedOffer?.teamId), isUser: true, years: 2, aav: 2_000_000, createdWeek: 1, status: "PENDING" }],
          },
        },
      } as any,
      { type: "FA_COMPLETE_PHASE" } as any,
    );

    expect(blocked.offseason.stepId).toBe("FREE_AGENCY");

    const complete = gameReducer({ ...blocked, freeAgency: { ...blocked.freeAgency, offersByPlayerId: {} } }, { type: "FA_COMPLETE_PHASE" } as any);
    expect(complete.offseason.stepId).toBe("PRE_DRAFT");
  });

  it("entering a new season free-agency market resets stale FA offer state", () => {
    const base = initState();
    const stale = {
      ...base,
      season: base.season + 1,
      careerStage: "FREE_AGENCY" as const,
      offseason: { ...base.offseason, stepId: OffseasonStepEnum.FREE_AGENCY },
      freeAgency: {
        ...base.freeAgency,
        initializedForSeason: base.season,
        initStatus: "ready" as const,
        offersByPlayerId: {
          STALE_P: [{ offerId: "OLD", playerId: "STALE_P", teamId: String(base.acceptedOffer?.teamId ?? ""), isUser: true, years: 2, aav: 2_000_000, createdWeek: 1, status: "PENDING" }],
        },
        signingsByPlayerId: { STALE_P: { teamId: "ATLANTA_APEX", years: 2, aav: 2_000_000, signingBonus: 0 } },
        draftByPlayerId: { STALE_P: { years: 2, aav: 2_000_000 } },
        activity: [{ ts: 1, text: "stale" }],
      },
    } as any;

    const out = gameReducer(stale, { type: "FA_ENTER_MARKET" } as any);

    expect(out.freeAgency.initializedForSeason).toBe(stale.season);
    expect(out.freeAgency.offersByPlayerId).toEqual({});
    expect(out.freeAgency.signingsByPlayerId).toEqual({});
    expect(out.freeAgency.draftByPlayerId).toEqual({});
    expect(out.freeAgency.activity).toEqual([]);
  });

});
