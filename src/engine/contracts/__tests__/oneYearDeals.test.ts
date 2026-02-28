import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getContractById, getPlayers, getTeamById } from "@/data/leagueDb";
import { capHitForOverride, getContractSummaryForPlayer, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import type { ResignOffer } from "@/engine/offseasonData";

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

describe("one-year contract deals", () => {
  function findExpiringPlayerId(state: GameState, teamId: string) {
    const expiring = getEffectivePlayersByTeam(state, teamId).find((p: any) => {
      const summary = getContractSummaryForPlayer(state, String(p.playerId));
      return Number(summary?.endSeason) === Number(state.season);
    });
    return expiring ? String((expiring as any).playerId) : null;
  }

  function makeOneYearOffer(): ResignOffer {
    return {
      years: 1,
      apy: 20_000_000,
      guaranteesPct: 0.6,
      discountPct: 0,
      createdFrom: "RESIGN_SCREEN",
    };
  }

  it("resign offer with years=1 yields startSeason=endSeason", () => {
    const candidate = getPlayers().find((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();

    const teamId = String((candidate as any).teamId);
    const playerId = String((candidate as any).playerId);
    const state = initStateForTeam(teamId);

    const next = gameReducer(state, {
      type: "EXTEND_PLAYER",
      payload: { playerId, years: 1, apy: 5_000_000, signingBonus: 500_000, guaranteedAtSigning: 1_500_000 },
    });

    const ovr = next.playerContractOverrides[playerId];
    expect(ovr.startSeason).toBe(state.season + 1);
    expect(ovr.endSeason).toBe(state.season + 1);
  });

  it("accepting a one-year re-sign replaces the contract object and keeps player on roster", () => {
    const state = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(state.acceptedOffer?.teamId ?? "");
    const playerId = findExpiringPlayerId(state, teamId);
    expect(playerId).toBeTruthy();

    const existingOverride = {
      startSeason: state.season,
      endSeason: state.season,
      salaries: [1_000_000],
      signingBonus: 0,
    };
    const seeded = {
      ...state,
      playerContractOverrides: {
        ...state.playerContractOverrides,
        [String(playerId)]: existingOverride,
      },
    };

    const drafted = gameReducer(seeded, {
      type: "RESIGN_SET_DECISION",
      payload: {
        playerId: String(playerId),
        decision: { action: "RESIGN", offer: makeOneYearOffer() },
      },
    });
    const accepted = gameReducer(drafted, { type: "RESIGN_ACCEPT_OFFER", payload: { playerId: String(playerId) } });

    const ovr = accepted.playerContractOverrides[String(playerId)];
    expect(ovr).toBeTruthy();
    expect(ovr).not.toBe(existingOverride);
    expect(ovr.startSeason).toBe(state.season + 1);
    expect(ovr.endSeason).toBe(state.season + 1);
    expect(String(accepted.playerTeamOverrides[String(playerId)] ?? "")).not.toBe("FREE_AGENT");
  });

  it("one-year re-sign affects cap and expires after next offseason", () => {
    const state = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(state.acceptedOffer?.teamId ?? "");
    const playerId = findExpiringPlayerId(state, teamId);
    expect(playerId).toBeTruthy();

    const drafted = gameReducer(state, {
      type: "RESIGN_SET_DECISION",
      payload: {
        playerId: String(playerId),
        decision: { action: "RESIGN", offer: makeOneYearOffer() },
      },
    });
    const signed = gameReducer(drafted, { type: "RESIGN_ACCEPT_OFFER", payload: { playerId: String(playerId) } });

    const signedNextSeason = gameReducer(signed, { type: "ADVANCE_SEASON" });
    const signedOverride = signed.playerContractOverrides[String(playerId)];
    const expectedCapHit = capHitForOverride(signedOverride, state.season + 1);
    const summary = getContractSummaryForPlayer(signedNextSeason, String(playerId));
    expect(Number(summary?.capHit ?? 0)).toBe(expectedCapHit);

    expect(String(signedNextSeason.playerTeamOverrides[String(playerId)] ?? "")).not.toBe("FREE_AGENT");

    const postExpiry = gameReducer(signedNextSeason, { type: "ADVANCE_SEASON" });
    expect(postExpiry.playerContractOverrides[String(playerId)]).toBeUndefined();
    expect(String(postExpiry.playerTeamOverrides[String(playerId)] ?? "")).toBe("FREE_AGENT");
  });

  it("one-year re-sign contract override survives JSON reload deterministically", () => {
    const state = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(state.acceptedOffer?.teamId ?? "");
    const playerId = findExpiringPlayerId(state, teamId);
    expect(playerId).toBeTruthy();

    const drafted = gameReducer(state, {
      type: "RESIGN_SET_DECISION",
      payload: {
        playerId: String(playerId),
        decision: { action: "RESIGN", offer: makeOneYearOffer() },
      },
    });
    const signed = gameReducer(drafted, { type: "RESIGN_ACCEPT_OFFER", payload: { playerId: String(playerId) } });

    const persisted = JSON.parse(JSON.stringify(signed)) as GameState;
    expect(persisted.playerContractOverrides[String(playerId)]).toEqual(signed.playerContractOverrides[String(playerId)]);
  });

  it("FA offer draft accepts years=1", () => {
    const candidate = getPlayers()[0] as any;
    expect(candidate).toBeTruthy();

    const state = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const playerId = String(candidate.playerId);
    const next = gameReducer(state, { type: "FA_SET_DRAFT", payload: { playerId, years: 1, aav: 2_000_000 } });

    expect(next.freeAgency.draftByPlayerId[playerId]?.years).toBe(1);
  });

  it("one-year cap proration math remains finite and non-negative", () => {
    const hit = capHitForOverride(
      { startSeason: 2030, endSeason: 2030, salaries: [2_000_000], signingBonus: 1_000_000 },
      2030,
    );

    expect(Number.isFinite(hit)).toBe(true);
    expect(hit).toBeGreaterThanOrEqual(0);
  });
});
