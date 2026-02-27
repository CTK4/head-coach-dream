import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getContractById, getPlayers, getTeamById } from "@/data/leagueDb";
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

describe("one-year contract deals", () => {
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
