import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRACTICE_PLAN,
  PRACTICE_POINTS_BUDGET,
  getEffectPreview,
  getPracticeEffect,
  migratePracticePlan,
  resolveInstallFamiliarity,
} from "@/engine/practiceFocus";
import { applyPracticePlanForWeek, applyPracticePlanForWeekAtomic, migrateSave } from "@/context/GameContext";
import { DEFAULT_PRACTICE_PLAN, getEffectPreview, getPracticeEffect, resolveInstallFamiliarity } from "@/engine/practiceFocus";
import { applyPracticePlanForWeek, applyPracticePlanForWeekAtomic, gameReducer, migrateSave } from "@/context/GameContext";
import type { GameState } from "@/context/GameContext";
import { getTeams, getPlayers } from "@/data/leagueDb";

function baselineState(teamId: string): GameState {
  const migrated = migrateSave({ saveVersion: 1, saveSeed: 123, season: 2026, week: 3, acceptedOffer: { teamId } as unknown as GameState["acceptedOffer"] });
  return {
    ...(migrated as GameState),
    playerTeamOverrides: (migrated as GameState).playerTeamOverrides ?? {},
    playerContractOverrides: (migrated as GameState).playerContractOverrides ?? {},
    playerFatigueById: (migrated as GameState).playerFatigueById ?? {},
    playerDevXpById: (migrated as GameState).playerDevXpById ?? {},
    practicePlan: (migrated as GameState).practicePlan ?? DEFAULT_PRACTICE_PLAN,
    practicePlanConfirmed: (migrated as GameState).practicePlanConfirmed ?? false,
    saveSeed: (migrated as GameState).saveSeed ?? 123,
    injuries: (migrated as GameState).injuries ?? [],
  } as GameState;
}

describe("practice allocation model", () => {
  it("migrates legacy focus/intensity saves into allocation budget", () => {
    const plan = migratePracticePlan({ primaryFocus: "Install", intensity: "High" });
    expect(plan.weeklyBudget).toBe(PRACTICE_POINTS_BUDGET);
    expect(plan.allocation.schemeInstall).toBeGreaterThan(plan.allocation.fundamentals);
  });

  it("preview exposes scheme and retention effects", () => {
    const preview = getEffectPreview(DEFAULT_PRACTICE_PLAN);
    expect(preview.schemeConceptBonus).toBeGreaterThan(0);
    expect(preview.lateGameRetentionBonus).toBeGreaterThan(0);
  });

  it("install allocation grants measurable familiarity", () => {
    const gain = resolveInstallFamiliarity(99, 4, "P1", getPracticeEffect(DEFAULT_PRACTICE_PLAN).familiarityGain);
    expect(gain).toBeGreaterThan(0);
  });
});

describe("practice integration", () => {
  it("injured player skips devXP but still gets fatigue effect", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const state = baselineState(teamId);
    const teamPlayer = getPlayers().find((p) => String(p.teamId) === teamId);
    expect(teamPlayer, `No player found on team ${teamId}`).toBeDefined();
    const injuredPlayerId = String(teamPlayer!.playerId);
    const seeded: GameState = {
      ...state,
      practicePlan: { ...DEFAULT_PRACTICE_PLAN, allocation: { fundamentals: 4, schemeInstall: 1, conditioning: 1 } },
      injuries: [{ id: "i1", playerId: injuredPlayerId, teamId, injuryType: "Test", bodyArea: "OTHER", severity: "MINOR", status: "OUT", startWeek: 1, isSeasonEnding: false }],
    };

    const beforeFatigue = seeded.playerFatigueById[injuredPlayerId].fatigue;
    const result = applyPracticePlanForWeek(seeded, teamId, 3).nextState;

    expect(result.playerFatigueById[injuredPlayerId].fatigue).toBeLessThan(beforeFatigue);
    expect(result.playerDevXpById[injuredPlayerId] ?? 0).toBe(0);
  });

  it("week advance practice application is atomic on throw", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const state = baselineState(teamId);
    const teamPlayer = getPlayers().find((p) => String(p.teamId) === teamId);
    expect(teamPlayer, `No player found on team ${teamId}`).toBeDefined();
    const failPlayerId = String(teamPlayer!.playerId);
    const seeded: GameState = { ...state, practicePlan: DEFAULT_PRACTICE_PLAN };

    const out = applyPracticePlanForWeekAtomic(seeded, teamId, 3, failPlayerId);
    expect(out.applied).toBe(false);
    expect(out.state).toBe(seeded);
  });

  it("migration defaults missing practicePlan", () => {
    const migrated = migrateSave({ saveVersion: 1, saveSeed: 1, season: 2026 });
    expect((migrated as GameState).practicePlan).toEqual(DEFAULT_PRACTICE_PLAN);
  });



  it("applied practice familiarity carries into game sim bonus", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const opponent = getTeams().find((t) => t.teamId !== teamId)?.teamId ?? "ATLANTA_APEX";
    const seeded: GameState = {
      ...baselineState(teamId),
      acceptedOffer: { teamId } as unknown as GameState["acceptedOffer"],
      weeklyFamiliarityBonus: 0,
      practicePlan: { primaryFocus: "Install", intensity: "High" },
      playerFamiliarityById: {},
    };

    const withPractice = applyPracticePlanForWeek(seeded, teamId, 3).nextState;
    expect(withPractice.weeklyFamiliarityBonus).toBeGreaterThan(0);

    const started = gameReducer(withPractice, {
      type: "START_GAME",
      payload: { opponentTeamId: opponent, weekType: "REGULAR_SEASON", weekNumber: 3 },
    });

    expect(started.game.practiceExecutionBonus).toBe(withPractice.weeklyFamiliarityBonus);
    expect(started.game.practiceExecutionBonus).toBeGreaterThan(0);
  });

  it("combine reveal data persists through draft init", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const seeded = baselineState(teamId);
    const prospectId = Object.keys(seeded.offseasonData.combine.results)[0];
    expect(prospectId).toBeDefined();

    const before = seeded.offseasonData.combine.results[prospectId];
    expect(before).toBeDefined();

    const drafted = gameReducer({ ...seeded, careerStage: "DRAFT" }, { type: "DRAFT_INIT" });

    expect(drafted.offseasonData.combine.results[prospectId]).toEqual(before);
  });
  it("default plan applies when no explicit selection exists", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const state = baselineState(teamId);
    const seeded: GameState = { ...state, practicePlan: DEFAULT_PRACTICE_PLAN, practicePlanConfirmed: false };
    const result = applyPracticePlanForWeek(seeded, teamId, 3).nextState;
    expect(result.practicePlan).toEqual(DEFAULT_PRACTICE_PLAN);
  });
});
