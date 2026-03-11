import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";

function initStateForTeam(teamId: string): GameState {
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

  return gameReducer(seeded, {
    type: "INIT_FREE_PLAY_CAREER",
    payload: { teamId, teamName: "Test Team" },
  });
}

describe("free agency manual action ledger parity", () => {
  it("FA_ACCEPT_OFFER signs once, closes loser offer, and updates canonical surfaces", () => {
    const teamId = "CHI";
    const playerId = "PLY_000001";
    const state = initStateForTeam(teamId);
    const preCounter = Number(state.transactionLedger.counter ?? 0);

    const withOffers = {
      ...state,
      careerStage: "FREE_AGENCY" as const,
      playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: "FREE_AGENT" },
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          ...state.freeAgency.offersByPlayerId,
          [playerId]: [
            { offerId: "O1", playerId, teamId, isUser: true, years: 3, aav: 4_500_000, createdWeek: 1, status: "PENDING" as const },
            { offerId: "O2", playerId, teamId: "DAL", isUser: false, years: 2, aav: 4_000_000, createdWeek: 1, status: "PENDING" as const },
          ],
        },
      },
    } as GameState;

    const next = gameReducer(withOffers, { type: "FA_ACCEPT_OFFER", payload: { playerId, offerId: "O1" } });

    expect(Number(next.transactionLedger.counter)).toBe(preCounter + 1);
    expect(next.transactionLedger.events.at(-1)?.kind).toBe("SIGN_FA");
    expect(next.playerTeamOverrides[playerId]).toBe(teamId);
    expect(next.playerContractOverrides[playerId]).toBeTruthy();
    expect((next.freeAgency.offersByPlayerId[playerId] ?? []).find((o) => o.offerId === "O2")?.status).toBe("REJECTED");
  });

  it("FA_WITHDRAW_OFFER marks offer withdrawn without mutating team/contract surfaces", () => {
    const teamId = "CHI";
    const playerId = "PLY_000002";
    const state = initStateForTeam(teamId);
    const preCounter = Number(state.transactionLedger.counter ?? 0);

    const withOffer = {
      ...state,
      careerStage: "FREE_AGENCY" as const,
      playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: "FREE_AGENT" },
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          ...state.freeAgency.offersByPlayerId,
          [playerId]: [
            { offerId: "O3", playerId, teamId, isUser: true, years: 2, aav: 2_000_000, createdWeek: 1, status: "PENDING" as const },
          ],
        },
      },
    } as GameState;

    const next = gameReducer(withOffer, { type: "FA_WITHDRAW_OFFER", payload: { playerId, offerId: "O3" } });

    expect(Number(next.transactionLedger.counter)).toBe(preCounter);
    expect((next.freeAgency.offersByPlayerId[playerId] ?? []).find((o) => o.offerId === "O3")?.status).toBe("WITHDRAWN");
    expect(next.freeAgency.signingsByPlayerId[playerId]).toBeUndefined();
    expect(next.playerTeamOverrides[playerId]).toBe("FREE_AGENT");
    expect(next.playerContractOverrides[playerId]).toBeUndefined();
  });
});
