import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer } from "@/context/GameContext";

describe("free agency resolver stability", () => {
  it("completes and respects iteration guard", () => {
    let state = createInitialStateForTests();
    state = {
      ...state,
      careerStage: "FREE_AGENCY",
      freeAgency: {
        ...state.freeAgency,
        initStatus: "ready",
        offersByPlayerId: Object.fromEntries(
          Array.from({ length: 5105 }, (_, i) => {
            const pid = `P_${i}`;
            return [pid, [{ offerId: `O_${i}`, playerId: pid, teamId: "MILWAUKEE_NORTHSHORE", isUser: false, years: 2, aav: 1_000_000 + i, createdWeek: 1, status: "PENDING" as const }]];
          })
        ),
      },
    };

    const next = gameReducer(state, { type: "FA_RESOLVE" });
    expect(next).toBeTruthy();
    expect(next.uiToast).toContain("stopped early");
  });
});
