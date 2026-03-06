import { describe, expect, it } from "vitest";
import { createInitialStateForTests } from "@/context/GameContext";
import { getUnifiedPhase, isInFranchiseActionWindow } from "@/engine/phaseUtils";
import { isActionAllowedInCurrentPhase } from "@/context/phaseGuards";
import { migrateSaveSchema } from "@/lib/migrations/saveSchema";

describe("phaseUtils", () => {
  it("prioritizes careerStage over week-derived value", () => {
    const base = createInitialStateForTests();
    const state = { ...base, careerStage: "DRAFT", league: { ...base.league, week: 10 } };
    expect(getUnifiedPhase(state)).toBe("DRAFT");
  });

  it("falls back to week-based derivation when careerStage is invalid", () => {
    const base = createInitialStateForTests();
    const state = { ...base, careerStage: "NOT_A_STAGE" as any, league: { ...base.league, week: 8, phase: "REGULAR_SEASON" } };
    expect(getUnifiedPhase(state)).toBe("IN_SEASON");
  });

  it("falls back to postseason hint from league.phase when needed", () => {
    const base = createInitialStateForTests();
    const state = { ...base, careerStage: "UNKNOWN" as any, league: { ...base.league, week: 5, phase: "WILD_CARD" } };
    expect(getUnifiedPhase(state)).toBe("POSTSEASON");
  });

  it("trade action window blocks playoffs and allows regular season", () => {
    expect(isInFranchiseActionWindow("PLAYOFFS", "trade")).toBe(false);
    expect(isInFranchiseActionWindow("REGULAR_SEASON", "trade")).toBe(true);
  });

  it("legacy save missing careerStage gets normalized and blocks FA_SIGN", () => {
    const migrated = migrateSaveSchema({ phase: "HUB", season: 2026, coach: { name: "Coach" }, league: { week: 8, tradeDeadlineWeek: 10 } } as any);
    expect(migrated.careerStage).toBe("REGULAR_SEASON");

    const verdict = isActionAllowedInCurrentPhase(migrated, { type: "FA_SIGN", payload: { offerId: "OFFER_1" } } as any);
    expect(verdict.allowed).toBe(false);
  });
});
