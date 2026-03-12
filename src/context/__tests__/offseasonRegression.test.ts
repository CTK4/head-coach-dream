import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { getEffectiveFreeAgents, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { OffseasonStepEnum } from "@/lib/stateMachine";
import { isActionAllowedInCurrentPhase } from "@/context/phaseGuards";
import { selectFreeAgencyPool } from "@/pages/hub/FreeAgency";

function initState(teamId = "MILWAUKEE_NORTHSHORE"): GameState {
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
  return gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId, teamName: "Test Team" } });
}

describe("offseason regression coverage", () => {
  it("free-agency selectors use effective overlay pool", () => {
    const base = initState();
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const candidate = getEffectivePlayersByTeam(base, teamId)[0];
    expect(candidate).toBeTruthy();
    const playerId = String((candidate as any).playerId);

    const withOverride: GameState = {
      ...base,
      playerTeamOverrides: { ...base.playerTeamOverrides, [playerId]: "FREE_AGENT" },
    };

    expect(getEffectiveFreeAgents(withOverride).some((p: any) => String(p.playerId) === playerId)).toBe(true);
    expect(selectFreeAgencyPool(withOverride).some((p: any) => String(p.id) === playerId)).toBe(true);
  });

  it("migrates tampering step to free agency", () => {
    const base = initState();
    const migrated = migrateSave({
      ...base,
      offseason: { ...base.offseason, stepId: OffseasonStepEnum.TAMPERING },
      careerStage: "TAMPERING",
    }) as GameState;

    expect(migrated.offseason.stepId).toBe(OffseasonStepEnum.FREE_AGENCY);
    expect(migrated.careerStage).toBe("FREE_AGENCY");
  });

  it("finalize cuts persists team override to free agency", () => {
    const base = initState();
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const rosterIds = getEffectivePlayersByTeam(base, teamId).map((p: any) => String(p.playerId));
    const keepIds = rosterIds.slice(0, 53);
    const cutId = rosterIds.find((pid) => !keepIds.includes(pid));
    expect(cutId).toBeTruthy();

    const prepped: GameState = {
      ...base,
      rosterMgmt: {
        active: Object.fromEntries(keepIds.map((pid) => [pid, true])),
        cuts: { [String(cutId)]: true },
        finalized: false,
      },
    };

    const next = gameReducer(prepped, { type: "FINALIZE_CUTS" });
    expect(next.playerTeamOverrides[String(cutId)]).toBe("FREE_AGENT");
    expect(next.playerContractOverrides[String(cutId)]).toBeUndefined();
  });

  it("fresh save has non-empty effective free-agent pool", () => {
    const base = initState();
    const effective = getEffectiveFreeAgents(base).length;
    const total = getPlayers().length;

    expect(total).toBeGreaterThan(0);
    expect(effective).toBeGreaterThan(0);
  });

  it("advances from DRAFT to TRAINING_CAMP when DRAFT step is complete", () => {
    const base = initState();
    const inDraft: GameState = {
      ...base,
      offseason: {
        ...base.offseason,
        stepId: OffseasonStepEnum.DRAFT,
        stepsComplete: { ...base.offseason.stepsComplete, DRAFT: true },
      },
      careerStage: "DRAFT",
    };

    const next = gameReducer(inDraft, { type: "OFFSEASON_ADVANCE_STEP" });

    expect(next.offseason.stepId).toBe(OffseasonStepEnum.TRAINING_CAMP);
  });

  it("free agency completion allows advance to pre-draft", () => {
    const base = initState();
    const inFreeAgency: GameState = {
      ...base,
      careerStage: "FREE_AGENCY",
      offseason: {
        ...base.offseason,
        stepId: OffseasonStepEnum.FREE_AGENCY,
        stepsComplete: { ...base.offseason.stepsComplete, FREE_AGENCY: true },
      },
    };

    const advanced = gameReducer(inFreeAgency, { type: "OFFSEASON_ADVANCE_STEP" });

    expect(advanced.offseason.stepId).toBe(OffseasonStepEnum.PRE_DRAFT);
    expect(advanced.careerStage).toBe("PRE_DRAFT");
  });

  it("legacy in-season save missing careerStage is not remapped into offseason", () => {
    const base = initState();
    const migrated = migrateSave({
      ...base,
      season: 2031,
      week: 9,
      careerStage: undefined,
      league: { ...base.league, phase: "REGULAR_SEASON", week: 9 },
      offseason: {
        ...base.offseason,
        stepId: OffseasonStepEnum.FREE_AGENCY,
      },
    }) as GameState;

    expect(migrated.careerStage).toBe("REGULAR_SEASON");

    const tradeVerdict = isActionAllowedInCurrentPhase(migrated, {
      type: "TRADE_ACCEPT",
      payload: { playerId: "PLAYER_1", toTeamId: "BOSTON_HARBOR", valueTier: "2nd" },
    } as any);
    expect(tradeVerdict.allowed).toBe(true);
  });

  it("legacy save missing careerStage and offseason does not default into offseason", () => {
    const base = initState();
    const migrated = migrateSave({
      ...base,
      season: 2032,
      week: 10,
      careerStage: undefined,
      league: { ...base.league, phase: "REGULAR_SEASON", week: 10 },
      offseason: undefined,
    }) as GameState;

    expect(migrated.careerStage).toBe("REGULAR_SEASON");
  });


  it("legacy preseason save missing careerStage infers PRESEASON", () => {
    const base = initState();
    const migrated = migrateSave({
      ...base,
      careerStage: undefined,
      league: { ...base.league, phase: "PRESEASON" },
    }) as GameState;

    expect(migrated.careerStage).toBe("PRESEASON");
  });

  it("ambiguous sparse save missing careerStage does not auto-infer REGULAR_SEASON", () => {
    const migrated = migrateSave({
      season: 2035,
      week: 1,
      careerStage: undefined,
      league: undefined,
      offseason: undefined,
    } as any) as GameState;

    expect(migrated.careerStage).toBe("OFFSEASON_HUB");
  });
  it("offseason signal can remap CUT_DOWNS to OFFSEASON_HUB when careerStage is missing", () => {
    const base = initState();
    const migrated = migrateSave({
      ...base,
      careerStage: undefined,
      league: { ...base.league, phase: "OFFSEASON" },
      offseason: { ...base.offseason, stepId: OffseasonStepEnum.CUT_DOWNS },
    }) as GameState;

    expect(migrated.careerStage).toBe("OFFSEASON_HUB");
  });
  it("migrateSave aligns FREE_AGENCY when an independent offseason signal exists", () => {
    const base = initState();
    const migrated = migrateSave({
      ...base,
      season: 2030,
      week: 8,
      careerStage: undefined,
      league: { ...base.league, phase: "OFFSEASON" },
      offseason: {
        ...base.offseason,
        stepId: OffseasonStepEnum.FREE_AGENCY,
      },
    }) as GameState;

    expect(migrated.offseason.stepId).toBe(OffseasonStepEnum.FREE_AGENCY);
    expect(migrated.careerStage).toBe("FREE_AGENCY");

    const phaseVerdict = isActionAllowedInCurrentPhase(migrated, { type: "FA_SUBMIT_OFFER", payload: { playerId: "PLAYER_1" } } as any);
    expect(phaseVerdict.allowed).toBe(true);
  });

  it("supports legacy TRADE_PLAYER action by routing to TRADE_ACCEPT behavior", () => {
    const base = initState();
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const playerId = String((getEffectivePlayersByTeam(base, teamId)[0] as any)?.playerId ?? "");
    expect(playerId).toBeTruthy();

    const deadlineBlocked: GameState = {
      ...base,
      week: 99,
      league: { ...base.league, week: 99, tradeDeadlineWeek: 8 },
    };

    const out = gameReducer(deadlineBlocked, { type: "TRADE_PLAYER", payload: { playerId, toTeamId: "BOSTON_HARBOR", valueTier: "2nd" } } as any);
    expect(out.tradeError?.code).toBe("TRADE_DEADLINE_PASSED");
  });

});
