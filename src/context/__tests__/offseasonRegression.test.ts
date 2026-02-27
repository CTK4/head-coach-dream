import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { getEffectiveFreeAgents, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { OffseasonStepEnum } from "@/lib/stateMachine";
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
});
