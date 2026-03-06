import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer, type GameAction } from "@/context/GameContext";
import { isActionAllowedInCurrentPhase } from "@/context/phaseGuards";
import { migrateSaveSchema } from "@/lib/migrations/saveSchema";

function withCareerStage(stage: ReturnType<typeof createInitialStateForTests>["careerStage"]) {
  return { ...createInitialStateForTests(), careerStage: stage };
}

describe("phaseGuards", () => {
  it("rejects FA_SIGN outside FREE_AGENCY", () => {
    const state = withCareerStage("REGULAR_SEASON");
    const verdict = isActionAllowedInCurrentPhase(state, { type: "FA_SIGN", payload: { offerId: "OFFER_1" } });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toContain("FREE_AGENCY");
  });

  it("allows FA_SIGN in FREE_AGENCY", () => {
    const state = withCareerStage("FREE_AGENCY");
    const verdict = isActionAllowedInCurrentPhase(state, { type: "FA_SIGN", payload: { offerId: "OFFER_1" } });
    expect(verdict.allowed).toBe(true);
  });

  it("rejects TRADE_ACCEPT after trade deadline", () => {
    const state = {
      ...withCareerStage("REGULAR_SEASON"),
      league: { ...withCareerStage("REGULAR_SEASON").league, week: 12, tradeDeadlineWeek: 10 },
    };
    const verdict = isActionAllowedInCurrentPhase(state, { type: "TRADE_ACCEPT", payload: { playerId: "PLY_1", toTeamId: "T2", valueTier: "2nd" } });
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toContain("trade deadline");
  });

  it("allows TRADE_ACCEPT before trade deadline", () => {
    const base = withCareerStage("REGULAR_SEASON");
    const state = { ...base, league: { ...base.league, week: 8, tradeDeadlineWeek: 10 } };
    const verdict = isActionAllowedInCurrentPhase(state, { type: "TRADE_ACCEPT", payload: { playerId: "PLY_1", toTeamId: "T2", valueTier: "2nd" } });
    expect(verdict.allowed).toBe(true);
  });

  it("rejects DRAFT_USER_PICK outside DRAFT", () => {
    const state = withCareerStage("FREE_AGENCY");
    const verdict = isActionAllowedInCurrentPhase(state, { type: "DRAFT_USER_PICK", payload: { prospectId: "P_1" } });
    expect(verdict.allowed).toBe(false);
  });

  it("allows DRAFT_USER_PICK in DRAFT", () => {
    const state = withCareerStage("DRAFT");
    const verdict = isActionAllowedInCurrentPhase(state, { type: "DRAFT_USER_PICK", payload: { prospectId: "P_1" } });
    expect(verdict.allowed).toBe(true);
  });

  it("reducer hard-blocks out-of-phase FA_SIGN in dev", () => {
    const state = withCareerStage("REGULAR_SEASON");
    expect(() => gameReducer(state, { type: "FA_SIGN", payload: { offerId: "OFFER_1" } } as GameAction)).toThrow(/phase_guard/);
  });

  it("reducer surfaces TRADE_DEADLINE_PASSED on blocked trade", () => {
    const base = withCareerStage("REGULAR_SEASON");
    const state = { ...base, league: { ...base.league, week: 12, tradeDeadlineWeek: 10 } };
    const out = gameReducer(state, { type: "TRADE_ACCEPT", payload: { playerId: "PLY_1", toTeamId: "T2", valueTier: "2nd" } });
    expect(out.tradeError?.code).toBe("TRADE_DEADLINE_PASSED");
  });

  it("migration hardens missing phase fields and deadline values", () => {
    const migrated = migrateSaveSchema({ phase: "HUB", season: 2026, coach: { name: "Coach" }, league: { week: -9, tradeDeadlineWeek: 0 } } as any);
    expect(migrated.league.week).toBe(1);
    expect(migrated.league.tradeDeadlineWeek).toBe(10);
    expect(migrated.careerStage).toBeDefined();
  });

  it("legacy TRADE_PLAYER throws deprecation error in dev", () => {
    const state = withCareerStage("REGULAR_SEASON");
    expect(() => gameReducer(state, { type: "TRADE_PLAYER", payload: { playerId: "PLY_1" } } as GameAction)).toThrow(/deprecated/);
  });
});
