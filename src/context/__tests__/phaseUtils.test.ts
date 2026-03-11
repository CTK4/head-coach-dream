import { describe, expect, it } from "vitest";
import { createInitialStateForTests } from "@/context/GameContext";
import { getUnifiedPhase, isInFranchiseActionWindow } from "@/engine/phaseUtils";
import { isActionAllowedInCurrentPhase } from "@/context/phaseGuards";
import { migrateSaveSchema } from "@/lib/migrations/saveSchema";
import { advanceToDraft, advanceToFreeAgency, advanceToRegularSeason } from "@/engine/phaseTransitions";

describe("phaseUtils", () => {
  it("prioritizes careerStage over week-derived value", () => {
    const base = createInitialStateForTests();
    const state = { ...base, careerStage: "DRAFT", league: { ...base.league, week: 10 } };
    expect(getUnifiedPhase(state)).toBe("DRAFT");
  });

  it("throws in dev when careerStage is invalid", () => {
    const base = createInitialStateForTests();
    const state = { ...base, careerStage: "NOT_A_STAGE" as any };
    expect(() => getUnifiedPhase(state)).toThrow(/phase_utils/);
  });

  it("trade action window blocks playoffs and allows regular season", () => {
    expect(isInFranchiseActionWindow("PLAYOFFS", "trade")).toBe(false);
    expect(isInFranchiseActionWindow("REGULAR_SEASON", "trade")).toBe(true);
    expect(isInFranchiseActionWindow("IN_SEASON", "trade")).toBe(true);
  });

  it("legacy save missing careerStage gets normalized and blocks FA_SUBMIT_OFFER", () => {
    const migrated = migrateSaveSchema({ phase: "HUB", season: 2026, coach: { name: "Coach" }, league: { week: 8, tradeDeadlineWeek: 10 } } as any);
    expect(migrated.careerStage).toBe("REGULAR_SEASON");

    const verdict = isActionAllowedInCurrentPhase(migrated, { type: "FA_SUBMIT_OFFER", payload: { playerId: "P1" } } as any);
    expect(verdict.allowed).toBe(false);
  });

  it("phase transitions set career stage and league phase consistently", () => {
    const base = createInitialStateForTests();
    const faState = advanceToFreeAgency(base);
    expect(faState.careerStage).toBe("FREE_AGENCY");
    expect(faState.league.phase).toBe("FREE_AGENCY");

    const draftState = advanceToDraft(base);
    expect(draftState.careerStage).toBe("DRAFT");
    expect(draftState.league.phase).toBe("DRAFT");
  });

  it("advanceToRegularSeason synchronizes week fields", () => {
    const base = createInitialStateForTests();
    const state = { ...base, hub: { ...base.hub, regularSeasonWeek: 7 }, league: { ...base.league, week: 2, phase: "OFFSEASON" } };
    const next = advanceToRegularSeason(state);
    expect(next.careerStage).toBe("REGULAR_SEASON");
    expect(next.league.phase).toBe("REGULAR_SEASON");
    expect(next.league.week).toBe(7);
    expect(next.hub.regularSeasonWeek).toBe(7);
  });
});
