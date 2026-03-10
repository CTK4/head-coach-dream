import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { computeCapLedger } from "@/engine/capLedger";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";

function initFaState(): GameState {
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

describe("free agency resolution", () => {
  it("highest valid competing counter-offer wins and is canonically applied", () => {
    const state = initFaState();
    const [playerId] = (state.freeAgency.boardPlayerIds ?? []) as string[];
    const cpuA = "ATLANTA_APEX";
    const cpuB = "BOSTON_HARBORMEN";

    const prepared: GameState = {
      ...state,
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          [playerId]: [
            { offerId: "CNT_A", playerId, teamId: cpuA, isUser: false, years: 2, aav: 3_000_000, createdWeek: 1, status: "COUNTERED" },
            { offerId: "CNT_B", playerId, teamId: cpuB, isUser: false, years: 2, aav: 6_000_000, createdWeek: 1, status: "COUNTERED" },
          ],
        },
      },
    };

    const next = gameReducer(prepared, { type: "FA_ADVANCE_MARKET" } as any);

    expect(next.freeAgency.signingsByPlayerId[playerId]?.teamId).toBe(cpuB);
    expect(next.playerTeamOverrides[playerId]).toBe(cpuB);
    expect(next.transactionLedger.events.at(-1)?.kind).toBe("SIGN_FA");
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === playerId)).toBe(false);
  });

  it("invalid-cap offers are rejected before resolve and cannot win", () => {
    const state = initFaState();
    const [playerId] = (state.freeAgency.boardPlayerIds ?? []) as string[];
    const cpuTeam = "ATLANTA_APEX";
    const capSpace = Number(computeCapLedger(state, cpuTeam).capSpace ?? 0);

    const prepared: GameState = {
      ...state,
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          [playerId]: [
            { offerId: "CPU_TOO_RICH", playerId, teamId: cpuTeam, isUser: false, years: 3, aav: capSpace + 10_000_000, createdWeek: 1, status: "PENDING" },
          ],
        },
      },
    };

    const next = gameReducer(prepared, { type: "FA_ADVANCE_MARKET" } as any);
    const offer = next.freeAgency.offersByPlayerId[playerId]?.find((o: any) => o.offerId === "CPU_TOO_RICH");

    expect(offer?.status).toBe("REJECTED");
    expect(next.freeAgency.signingsByPlayerId[playerId]).toBeUndefined();
  });

  it("deterministic tiebreak is stable for equal offers", () => {
    const mk = () => {
      const state = initFaState();
      const [playerId] = (state.freeAgency.boardPlayerIds ?? []) as string[];
      return gameReducer(
        {
          ...state,
          freeAgency: {
            ...state.freeAgency,
            offersByPlayerId: {
              [playerId]: [
                { offerId: "EQ_A", playerId, teamId: "ATLANTA_APEX", isUser: false, years: 2, aav: 2_000_000, createdWeek: 1, status: "COUNTERED" },
                { offerId: "EQ_B", playerId, teamId: "BOSTON_HARBORMEN", isUser: false, years: 2, aav: 2_000_000, createdWeek: 1, status: "COUNTERED" },
              ],
            },
          },
        } as any,
        { type: "FA_ADVANCE_MARKET" } as any,
      );
    };

    const r1 = mk();
    const r2 = mk();
    expect(r1.freeAgency.signingsByPlayerId).toEqual(r2.freeAgency.signingsByPlayerId);
  });

  it("team cap cannot be spent twice across multiple signings in a single advance", () => {
    const state = initFaState();
    const [p1, p2] = (state.freeAgency.boardPlayerIds ?? []) as string[];
    const userTeam = String(state.acceptedOffer?.teamId ?? "");

    const prepared: GameState = {
      ...state,
      finances: { ...state.finances, capSpace: 4_000_000 },
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          [p1]: [{ offerId: "U1", playerId: p1, teamId: userTeam, isUser: true, years: 2, aav: 2_500_000, createdWeek: 1, status: "PENDING" }],
          [p2]: [{ offerId: "U2", playerId: p2, teamId: userTeam, isUser: true, years: 2, aav: 2_500_000, createdWeek: 1, status: "PENDING" }],
        },
      },
    };

    const next = gameReducer(prepared, { type: "FA_ADVANCE_MARKET" } as any);
    const statuses = [
      next.freeAgency.offersByPlayerId[p1]?.find((o: any) => o.offerId === "U1")?.status,
      next.freeAgency.offersByPlayerId[p2]?.find((o: any) => o.offerId === "U2")?.status,
    ];
    const accepted = statuses.filter((s) => s === "ACCEPTED").length;

    expect(accepted).toBeLessThanOrEqual(1);
    expect(statuses).toContain("REJECTED");
  });

  it("cpu-only pending winner is applied canonically through FA_ADVANCE_MARKET", () => {
    const state = initFaState();
    const [playerId] = (state.freeAgency.boardPlayerIds ?? []) as string[];
    const cpuTeam = "ATLANTA_APEX";

    const prepared: GameState = {
      ...state,
      freeAgency: {
        ...state.freeAgency,
        offersByPlayerId: {
          [playerId]: [{ offerId: "CPU_PEND_WIN", playerId, teamId: cpuTeam, isUser: false, years: 2, aav: 3_500_000, createdWeek: 1, status: "PENDING" }],
        },
      },
    };

    const next = gameReducer(prepared, { type: "FA_ADVANCE_MARKET" } as any);

    expect(next.freeAgency.signingsByPlayerId[playerId]?.teamId).toBe(cpuTeam);
    expect(next.playerTeamOverrides[playerId]).toBe(cpuTeam);
    expect(next.transactionLedger.events.some((ev: any) => ev.kind === "SIGN_FA" && String(ev.playerIds?.[0]) === playerId)).toBe(true);
  });

});
