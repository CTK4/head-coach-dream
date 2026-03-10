import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";

function makeFaState(): GameState {
  const seeded = gameReducer({} as GameState, {
    type: "INIT_NEW_GAME_FROM_STORY",
    payload: {
      offer: { teamId: "MILWAUKEE_NORTHSHORE", years: 4, salary: 4_000_000, autonomy: 65, patience: 55, mediaNarrativeKey: "story_start", base: { years: 4, salary: 4_000_000, autonomy: 65 } },
      teamName: "Test Team",
    },
  });
  const base = gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId: "MILWAUKEE_NORTHSHORE", teamName: "Test Team" } });
  return gameReducer({ ...base, careerStage: "FREE_AGENCY", offseason: { ...base.offseason, stepId: "FREE_AGENCY" as any } }, { type: "FA_ENTER_MARKET" } as any);
}

describe("free agency offer actions", () => {
  it("create draft, update draft, submit, withdraw", () => {
    const state = makeFaState();
    const playerId = String(state.freeAgency.boardPlayerIds?.[0]);

    const drafted = gameReducer(state, { type: "FA_CREATE_DRAFT", payload: { playerId } } as any);
    expect(drafted.freeAgency.draftByPlayerId[playerId]).toBeTruthy();

    const updated = gameReducer(drafted, { type: "FA_UPDATE_DRAFT", payload: { playerId, patch: { years: 3, apy: 2_000_000 } } } as any);
    expect(updated.freeAgency.draftByPlayerId[playerId]).toMatchObject({ years: 3, aav: 2_000_000 });

    const submitted = gameReducer(updated, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId } } as any);
    const offer = (submitted.freeAgency.offersByPlayerId[playerId] ?? []).find((o: any) => o.isUser && o.status === "PENDING");
    expect(offer).toBeTruthy();

    const withdrawn = gameReducer(submitted, { type: "FA_WITHDRAW_USER_OFFER", payload: { playerId, offerId: String(offer?.offerId) } } as any);
    expect((withdrawn.freeAgency.offersByPlayerId[playerId] ?? []).find((o: any) => o.offerId === offer?.offerId)?.status).toBe("WITHDRAWN");
  });

  it("prevents duplicate user pending offer submissions", () => {
    const state = makeFaState();
    const playerId = String(state.freeAgency.boardPlayerIds?.[0]);
    const drafted = gameReducer(state, { type: "FA_CREATE_DRAFT", payload: { playerId } } as any);
    const submitted = gameReducer(drafted, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId } } as any);
    const submittedAgain = gameReducer(submitted, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId } } as any);

    const pending = (submittedAgain.freeAgency.offersByPlayerId[playerId] ?? []).filter((o: any) => o.isUser && o.status === "PENDING");
    expect(pending).toHaveLength(1);
  });

  it("duplicate submit no-ops before portfolio-cap rejection", () => {
    const state = makeFaState();
    const playerId = String(state.freeAgency.boardPlayerIds?.[0]);
    const drafted = gameReducer(state, { type: "FA_CREATE_DRAFT", payload: { playerId } } as any);
    const updated = gameReducer(drafted, { type: "FA_UPDATE_DRAFT", payload: { playerId, patch: { apy: 2_000_000 } } } as any);
    const submitted = gameReducer({ ...updated, finances: { ...updated.finances, capSpace: 2_500_000 } }, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId } } as any);
    const submittedAgain = gameReducer(submitted, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId } } as any);

    const pending = (submittedAgain.freeAgency.offersByPlayerId[playerId] ?? []).filter((o: any) => o.isUser && o.status === "PENDING");
    expect(pending).toHaveLength(1);
    expect(submittedAgain.freeAgency.error).toBeUndefined();
  });


  it("prevents resubmit when user has COUNTERED offer on same player", () => {
    const state = makeFaState();
    const playerId = String(state.freeAgency.boardPlayerIds?.[0]);
    const userTid = String(state.acceptedOffer?.teamId ?? "");

    const withCounter = {
      ...state,
      freeAgency: {
        ...state.freeAgency,
        draftByPlayerId: { ...state.freeAgency.draftByPlayerId, [playerId]: { years: 2, aav: 2_000_000 } },
        offersByPlayerId: {
          ...state.freeAgency.offersByPlayerId,
          [playerId]: [{ offerId: "CNT_U", playerId, teamId: userTid, isUser: true, years: 2, aav: 2_000_000, createdWeek: 1, status: "COUNTERED" }],
        },
      },
    } as any;

    const out = gameReducer(withCounter, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId } } as any);
    const live = (out.freeAgency.offersByPlayerId[playerId] ?? []).filter((o: any) => o.isUser && (o.status === "PENDING" || o.status === "COUNTERED"));

    expect(live).toHaveLength(1);
    expect(live[0].status).toBe("COUNTERED");
  });

  it("COUNTERED user offers count toward portfolio cap", () => {
    const state = makeFaState();
    const [playerA, playerB] = (state.freeAgency.boardPlayerIds ?? []) as string[];
    const userTid = String(state.acceptedOffer?.teamId ?? "");

    const withCounter = {
      ...state,
      finances: { ...state.finances, capSpace: 3_000_000 },
      freeAgency: {
        ...state.freeAgency,
        draftByPlayerId: { ...state.freeAgency.draftByPlayerId, [playerB]: { years: 2, aav: 1_500_000 } },
        offersByPlayerId: {
          ...state.freeAgency.offersByPlayerId,
          [playerA]: [{ offerId: "CNT_CAP", playerId: playerA, teamId: userTid, isUser: true, years: 2, aav: 2_000_000, createdWeek: 1, status: "COUNTERED" }],
        },
      },
    } as any;

    const out = gameReducer(withCounter, { type: "FA_SUBMIT_USER_OFFER", payload: { playerId: playerB } } as any);
    expect(out.freeAgency.error).toBe("Insufficient cap space for this offer.");
    const pendingB = (out.freeAgency.offersByPlayerId[playerB] ?? []).filter((o: any) => o.isUser && o.status === "PENDING");
    expect(pendingB).toHaveLength(0);
  });

});
