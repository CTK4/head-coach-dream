import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getPlayers, getTeamById } from "@/data/leagueDb";
import { getContractSummaryForPlayer, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { capHitForOverride } from "@/engine/rosterOverlay";

function initStateForTeam(teamId: string): GameState {
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

  const teamName = getTeamById(teamId)?.name ?? "Test Team";
  return gameReducer(seeded, { type: "INIT_FREE_PLAY_CAREER", payload: { teamId, teamName } });
}

function findTeamAndPlayer(): { teamId: string; playerId: string } {
  const player = getPlayers().find((p: any) => String(p.teamId ?? "") && String(p.teamId) !== "FREE_AGENT");
  if (!player) throw new Error("No roster player found for extension regression tests.");
  return { teamId: String(player.teamId), playerId: String(player.playerId) };
}

function seedExtensionEligibleContract(state: GameState, playerId: string): GameState {
  return {
    ...state,
    playerContractOverrides: {
      ...state.playerContractOverrides,
      [String(playerId)]: {
        startSeason: state.season,
        endSeason: state.season + 1,
        salaries: [8_000_000, 9_000_000],
        signingBonus: 2_000_000,
      },
    },
  };
}

function submitExtension(state: GameState, playerId: string, years: number, apy: number): GameState {
  return gameReducer(state, {
    type: "EXTENSION_SUBMIT_OFFER",
    payload: {
      playerId: String(playerId),
      offer: {
        years,
        apy,
        guaranteesPct: 0.6,
        discountPct: 0,
        createdFrom: "AUDIT",
      },
    },
  });
}

function submitAcceptedExtension(state: GameState, playerId: string): GameState {
  const attempts = [20_000_000, 40_000_000, 80_000_000, 120_000_000];
  const baselineEndSeason = Number(state.playerContractOverrides[String(playerId)]?.endSeason ?? getContractSummaryForPlayer(state, String(playerId))?.endSeason ?? state.season);
  const teamId = String(state.acceptedOffer?.teamId ?? state.userTeamId ?? state.teamId ?? "");
  let next = {
    ...state,
    contracts: {
      ...state.contracts,
      playerTeamInterestById: {
        ...state.contracts.playerTeamInterestById,
        [String(playerId)]: {
          ...(state.contracts.playerTeamInterestById[String(playerId)] ?? {}),
          [teamId]: 100,
        },
      },
    },
    resign: {
      ...state.resign,
      rejectionCountByPlayerId: {
        ...state.resign.rejectionCountByPlayerId,
        [String(playerId)]: 0,
      },
    },
  };
  for (let seed = 1; seed <= 32; seed++) {
    for (const apy of attempts) {
      const seeded = { ...next, saveSeed: seed };
      next = submitExtension(seeded, playerId, 3, apy);
      const acceptedOverride = next.playerContractOverrides[String(playerId)];
      if (Number(acceptedOverride?.endSeason ?? 0) > baselineEndSeason) return next;
      next = gameReducer(next, { type: "EXTENSION_CLEAR_OFFER", payload: { playerId: String(playerId) } });
    }
  }
  throw new Error("Failed to produce accepted extension in deterministic attempts.");
}

describe("extension regression coverage", () => {
  it("eligible player extension can be submitted and accepted into new contract state", () => {
    const { teamId, playerId } = findTeamAndPlayer();
    const base = seedExtensionEligibleContract(initStateForTeam(teamId), playerId);

    const next = submitAcceptedExtension(base, playerId);
    const summary = getContractSummaryForPlayer(next, playerId);

    expect(summary).toBeTruthy();
    expect(Number(summary?.endSeason ?? 0)).toBeGreaterThan(base.season + 1);
    expect(next.offseasonData.resigning.decisions[String(playerId)]).toBeUndefined();
  });

  it("ineligible extension payload is rejected and contract state is unchanged", () => {
    const { teamId, playerId } = findTeamAndPlayer();
    const base = seedExtensionEligibleContract(initStateForTeam(teamId), playerId);
    const before = getContractSummaryForPlayer(base, playerId);

    const next = gameReducer(base, {
      type: "EXTENSION_SUBMIT_OFFER",
      payload: {
        playerId: String(playerId),
        offer: {
          years: 0,
          apy: 0,
          guaranteesPct: 0.6,
          discountPct: 0,
          createdFrom: "AUDIT",
        },
      },
    });

    const after = getContractSummaryForPlayer(next, playerId);
    expect(after).toEqual(before);
    expect(next.offseasonData.resigning.decisions[String(playerId)]).toBeUndefined();
  });

  it("tagged player can resolve to extension without stale tag artifacts", () => {
    const { teamId, playerId } = findTeamAndPlayer();
    const initial = seedExtensionEligibleContract(initStateForTeam(teamId), playerId);
    const expiring: GameState = {
      ...initial,
      playerContractOverrides: {
        ...initial.playerContractOverrides,
        [String(playerId)]: {
          startSeason: initial.season,
          endSeason: initial.season,
          salaries: [10_000_000],
          signingBonus: 0,
        },
      },
    };

    const tagged = gameReducer(expiring, { type: "APPLY_FRANCHISE_TAG", payload: { playerId: String(playerId) } });
    expect(tagged.offseasonData.tagCenter.applied?.playerId).toBe(String(playerId));
    expect(tagged.franchiseTags[String(playerId)]).toBeTruthy();

    const untagged = gameReducer(tagged, { type: "TAG_REMOVE" });
    const extended = submitAcceptedExtension(untagged, playerId);

    expect(extended.offseasonData.tagCenter.applied).toBeUndefined();
    expect(extended.franchiseTags[String(playerId)]).toBeUndefined();
    expect(extended.transactionLedger.events.some((e: any) => e.kind === "FRANCHISE_TAG_REMOVE")).toBe(true);

    const extendedOverride = extended.playerContractOverrides[String(playerId)];
    expect(Number(extendedOverride?.endSeason ?? 0)).toBeGreaterThan(extended.season);
    expect(extendedOverride?.contractType).not.toBe("FRANCHISE_TAG");
  });

  it("accepted extension updates contract summary and cap projection values", () => {
    const { teamId, playerId } = findTeamAndPlayer();
    const base = seedExtensionEligibleContract(initStateForTeam(teamId), playerId);
    const accepted = submitAcceptedExtension(base, playerId);
    const summary = getContractSummaryForPlayer(accepted, playerId);

    expect(summary).toBeTruthy();
    const nextSeason = base.season + 1;
    const override = accepted.playerContractOverrides[String(playerId)];
    const expectedNextYearCap = capHitForOverride(override, nextSeason);

    expect(Number(summary?.capHitBySeason?.[nextSeason] ?? 0)).toBe(expectedNextYearCap);
    expect(Number(summary?.totalValue ?? 0)).toBeGreaterThan(Number(getContractSummaryForPlayer(base, playerId)?.totalValue ?? 0));
  });

  it("extension ineligibility mirrors contract-screen gate for expiring/ufa players", () => {
    const { teamId } = findTeamAndPlayer();
    const state = initStateForTeam(teamId);
    const userTeamId = String(state.acceptedOffer?.teamId ?? "");

    const ineligible = getEffectivePlayersByTeam(state, userTeamId).find((p: any) => {
      const summary = getContractSummaryForPlayer(state, String(p.playerId));
      const yearsRemaining = Number(summary?.yearsRemaining ?? 0);
      return yearsRemaining <= 1;
    });

    expect(ineligible).toBeTruthy();
    const summary = getContractSummaryForPlayer(state, String((ineligible as any).playerId));
    const extensionEligible = Boolean(summary) && Number(summary?.yearsRemaining ?? 0) > 1;
    expect(extensionEligible).toBe(false);
  });
});
