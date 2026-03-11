import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducer, type GameAction } from "@/context/GameContext";
import { isActionAllowedInCurrentPhase, shouldForcePreseasonCutdownTransition } from "@/context/phaseGuards";
import { migrateSaveSchema } from "@/lib/migrations/saveSchema";
import { TRADE_DEADLINE_DEFAULT_WEEK } from "@/engine/tradeDeadline";

function withCareerStage(stage: ReturnType<typeof createInitialStateForTests>["careerStage"]) {
  return { ...createInitialStateForTests(), careerStage: stage };
}

describe("phaseGuards", () => {
  it("rejects FA_SUBMIT_OFFER outside FREE_AGENCY", () => {
    const state = withCareerStage("REGULAR_SEASON");
    const verdict = isActionAllowedInCurrentPhase(state, { type: "FA_SUBMIT_OFFER", payload: { playerId: "P1" } } as any);
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toContain("FREE_AGENCY");
  });

  it("allows FA_SUBMIT_OFFER in FREE_AGENCY", () => {
    const state = withCareerStage("FREE_AGENCY");
    const verdict = isActionAllowedInCurrentPhase(state, { type: "FA_SUBMIT_OFFER", payload: { playerId: "P1" } } as any);
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

  it("reducer no-ops out-of-phase FA_SUBMIT_OFFER", () => {
    const state = withCareerStage("REGULAR_SEASON");
    const out = gameReducer(state, { type: "FA_SUBMIT_OFFER", payload: { playerId: "P1" } } as GameAction);
    expect(out).toBe(state);
  });

  it("reducer no-ops out-of-phase DRAFT_CPU_ADVANCE", () => {
    const state = withCareerStage("REGULAR_SEASON");
    const out = gameReducer(state, { type: "DRAFT_CPU_ADVANCE" } as GameAction);
    expect(out).toBe(state);
  });

  it("reducer no-ops out-of-phase CONTRACT_RESTRUCTURE_APPLY", () => {
    const state = withCareerStage("PLAYOFFS");
    const out = gameReducer(state, { type: "CONTRACT_RESTRUCTURE_APPLY", payload: { playerId: "PLY_1", amount: 1000000 } } as GameAction);
    expect(out).toBe(state);
  });

  it("reducer surfaces TRADE_DEADLINE_PASSED on blocked trade", () => {
    const base = withCareerStage("REGULAR_SEASON");
    const state = { ...base, league: { ...base.league, week: 12, tradeDeadlineWeek: 10 } };
    const out = gameReducer(state, { type: "TRADE_ACCEPT", payload: { playerId: "PLY_1", toTeamId: "T2", valueTier: "2nd" } });
    expect(out.tradeError?.code).toBe("TRADE_DEADLINE_PASSED");
  });


  it("flags forced transition on final preseason ADVANCE_WEEK", () => {
    const base = withCareerStage("PRESEASON");
    const finalWeekState = { ...base, hub: { ...base.hub, preseasonWeek: base.hub.schedule.preseasonWeeks.length } };

    expect(shouldForcePreseasonCutdownTransition(finalWeekState, { type: "ADVANCE_WEEK" } as GameAction)).toBe(true);
  });

  it("does not force transition during mid-preseason ADVANCE_WEEK", () => {
    const base = withCareerStage("PRESEASON");
    const midWeekState = { ...base, hub: { ...base.hub, preseasonWeek: 1 } };

    expect(shouldForcePreseasonCutdownTransition(midWeekState, { type: "ADVANCE_WEEK" } as GameAction)).toBe(false);
  });

  it("migration hardens missing phase fields and deadline values", () => {
    const migrated = migrateSaveSchema({ phase: "HUB", season: 2026, coach: { name: "Coach" }, league: { week: -9, tradeDeadlineWeek: 0 } } as any);
    expect(migrated.league.week).toBe(1);
    expect(migrated.league.tradeDeadlineWeek).toBe(TRADE_DEADLINE_DEFAULT_WEEK);
    expect(migrated.careerStage).toBeDefined();
    expect(migrated.league.phase).toBe("OFFSEASON");
  });

});
