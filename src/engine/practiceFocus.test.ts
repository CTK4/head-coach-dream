import { describe, expect, it } from "vitest";
import { DEFAULT_PRACTICE_PLAN, getEffectPreview, getPracticeEffect, resolveInstallFamiliarity } from "@/engine/practiceFocus";
import { applyPracticePlanForWeek, applyPracticePlanForWeekAtomic, migrateSave } from "@/context/GameContext";
import type { GameState } from "@/context/GameContext";
import { getTeams, getPlayers } from "@/data/leagueDb";

function baselineState(teamId: string): GameState {
  const migrated = migrateSave({
    saveVersion: 1,
    saveSeed: 123,
    season: 2026,
    week: 3,
    acceptedOffer: { teamId } as unknown as GameState["acceptedOffer"],
  });
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

describe("practice focus constants + preview", () => {
  it("recovery focus is strongest fatigue reduction", () => {
    expect(getPracticeEffect({ primaryFocus: "Recovery", intensity: "High" }).fatigueBase).toBeLessThan(
      getPracticeEffect({ primaryFocus: "Conditioning", intensity: "High" }).fatigueBase,
    );
  });

  it("preview matches configured ranges", () => {
    const preview = getEffectPreview({ primaryFocus: "Install", intensity: "Normal" });
    expect(preview.familiarityRange).toEqual([2, 4]);
    expect(preview.fatigueRange).toEqual([5, 5]);
  });

  it("install focus measurably grants familiarity", () => {
    const gain = resolveInstallFamiliarity(99, 4, "P1", getPracticeEffect({ primaryFocus: "Install", intensity: "High" }).familiarityGain);
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
      practicePlan: { primaryFocus: "Fundamentals", intensity: "High" },
      injuries: [{ id: "i1", playerId: injuredPlayerId, teamId, injuryType: "Test", bodyArea: "OTHER", severity: "MINOR", status: "OUT", startWeek: 1, isSeasonEnding: false }],
    };

    const beforeFatigue = seeded.playerFatigueById[injuredPlayerId].fatigue;
    const result = applyPracticePlanForWeek(seeded, teamId, 3).nextState;

    expect(result.playerFatigueById[injuredPlayerId].fatigue).toBe(beforeFatigue + 3);
    expect(result.playerDevXpById[injuredPlayerId] ?? 0).toBe(0);
  });

  it("week advance practice application is atomic on throw", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const state = baselineState(teamId);
    const teamPlayer = getPlayers().find((p) => String(p.teamId) === teamId);
    expect(teamPlayer, `No player found on team ${teamId}`).toBeDefined();
    const failPlayerId = String(teamPlayer!.playerId);
    const seeded: GameState = { ...state, practicePlan: { primaryFocus: "Install", intensity: "High" } };

    const out = applyPracticePlanForWeekAtomic(seeded, teamId, 3, failPlayerId);
    expect(out.applied).toBe(false);
    expect(out.state).toBe(seeded);
  });

  it("migration defaults missing practicePlan", () => {
    const migrated = migrateSave({ saveVersion: 1, saveSeed: 1, season: 2026 });
    expect((migrated as GameState).practicePlan).toEqual(DEFAULT_PRACTICE_PLAN);
  });

  it("default plan applies when no explicit selection exists", () => {
    const teamId = getTeams().find((t) => t.isActive !== false)?.teamId ?? "MILWAUKEE_NORTHSHORE";
    const state = baselineState(teamId);
    const seeded: GameState = { ...state, practicePlan: DEFAULT_PRACTICE_PLAN, practicePlanConfirmed: false };
    const result = applyPracticePlanForWeek(seeded, teamId, 3).nextState;
    expect(result.practicePlan).toEqual(DEFAULT_PRACTICE_PLAN);
  });
});
