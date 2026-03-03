import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getPlayers, getTeamById } from "@/data/leagueDb";
import { buildContractIndex } from "@/engine/transactions/contractIndex";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";

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

  const teamName = getTeamById(teamId)?.name ?? "Test Team";
  return gameReducer(seeded, {
    type: "INIT_FREE_PLAY_CAREER",
    payload: { teamId, teamName },
  });
}

describe("free agency signing ledger parity", () => {
  it("routes FA_RESOLVE_WEEK user acceptance through exactly one SIGN_FA tx", () => {
    const player = getPlayers().find((p: any) => String(p.teamId ?? "") === "FREE_AGENT");
    expect(player).toBeTruthy();

    const teamId = "CHI";
    const playerId = String((player as any).playerId);
    const state = initStateForTeam(teamId);

    const preCounter = Number(state.transactionLedger.counter ?? 0);
    const withOffer = {
      ...state,
      careerStage: "FREE_AGENCY" as const,
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          ...state.freeAgency.offersByPlayerId,
          [playerId]: [
            {
              offerId: "OFFER_1",
              playerId,
              teamId,
              isUser: true,
              years: 3,
              aav: 4_500_000,
              createdWeek: 1,
              status: "PENDING" as const,
            },
          ],
        },
      },
    } as GameState;

    const next = gameReducer(withOffer, { type: "FA_RESOLVE_WEEK", payload: { week: 1 } });

    expect(Number(next.transactionLedger.counter)).toBe(preCounter + 1);
    expect(next.transactionLedger.events.at(-1)?.kind).toBe("SIGN_FA");

    const rosterIndex = buildRosterIndex({ ...next, playerTeamOverrides: {} } as any);
    expect(rosterIndex.playerToTeam[playerId]).toBe(teamId);

    const contractIndex = buildContractIndex({ ...next, playerContractOverrides: {} } as any);
    expect(contractIndex[playerId]).toBeTruthy();
    expect(Number(contractIndex[playerId]?.salaries?.[0] ?? 0)).toBeGreaterThan(0);
  });

  it("routes FA_RESPOND_COUNTER acceptance through exactly one SIGN_FA tx", () => {
    const player = getPlayers().find((p: any) => String(p.teamId ?? "") === "FREE_AGENT");
    expect(player).toBeTruthy();

    const teamId = "CHI";
    const playerId = String((player as any).playerId);
    const state = initStateForTeam(teamId);

    const preCounter = Number(state.transactionLedger.counter ?? 0);
    const withCounter = {
      ...state,
      careerStage: "FREE_AGENCY" as const,
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          ...state.freeAgency.offersByPlayerId,
          [playerId]: [
            {
              offerId: "COUNTER_1",
              playerId,
              teamId,
              isUser: true,
              years: 2,
              aav: 6_000_000,
              createdWeek: 1,
              status: "COUNTERED" as const,
            },
          ],
        },
      },
    } as GameState;

    const next = gameReducer(withCounter, { type: "FA_RESPOND_COUNTER", payload: { playerId, accept: true } });

    expect(Number(next.transactionLedger.counter)).toBe(preCounter + 1);
    expect(next.transactionLedger.events.at(-1)?.kind).toBe("SIGN_FA");

    const rosterIndex = buildRosterIndex({ ...next, playerTeamOverrides: {} } as any);
    expect(rosterIndex.playerToTeam[playerId]).toBe(teamId);

    const contractIndex = buildContractIndex({ ...next, playerContractOverrides: {} } as any);
    expect(contractIndex[playerId]).toBeTruthy();
  });
});
