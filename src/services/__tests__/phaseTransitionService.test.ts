import { describe, expect, it } from "vitest";
import { transitionToCareerPhase } from "@/services/phaseTransitionService";

function buildGameState() {
  return {
    careerStage: "RESIGN",
    week: 0,
    hub: { regularSeasonWeek: 22 },
    league: { phase: "RE_SIGN", week: 0 },
  } as any;
}

describe("phaseTransitionService", () => {
  it("transitions to free agency", () => {
    const next = transitionToCareerPhase(buildGameState(), "FREE_AGENCY");
    expect(next.careerStage).toBe("FREE_AGENCY");
    expect(next.league.phase).toBe("FREE_AGENCY");
  });

  it("transitions to draft", () => {
    const next = transitionToCareerPhase(buildGameState(), "DRAFT");
    expect(next.careerStage).toBe("DRAFT");
    expect(next.league.phase).toBe("DRAFT");
  });

  it("normalizes regular season week when transitioning to regular season", () => {
    const next = transitionToCareerPhase(buildGameState(), "REGULAR_SEASON");
    expect(next.careerStage).toBe("REGULAR_SEASON");
    expect(next.league.phase).toBe("REGULAR_SEASON");
    expect(next.week).toBe(18);
    expect(next.hub.regularSeasonWeek).toBe(18);
    expect(next.league.week).toBe(18);
  });
});
