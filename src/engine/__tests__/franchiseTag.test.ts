import { describe, expect, it } from "vitest";
import { gameReducer, createInitialStateForTests, migrateSave, type GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";

function firstRosterPlayer() {
  const p = getPlayers().find((x: any) => String(x.teamId ?? "") && String(x.teamId) !== "FREE_AGENT");
  if (!p) throw new Error("no roster player");
  return { playerId: String((p as any).playerId), teamId: String((p as any).teamId) };
}

describe("franchise tag", () => {
  it("applies 1-year tag and prevents FA expiry", { timeout: 20000 }, () => {
    const { playerId, teamId } = firstRosterPlayer();
    let state = createInitialStateForTests();
    state = { ...state, teamId, userTeamId: teamId, acceptedOffer: { ...(state.acceptedOffer ?? ({} as any)), teamId } as any };

    state.playerContractOverrides[playerId] = {
      startSeason: state.season,
      endSeason: state.season,
      salaries: [5_000_000],
      signingBonus: 0,
    };

    state = gameReducer(state, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    const nextSeason = state.season + 1;
    expect(state.playerContractOverrides[playerId]?.contractType).toBe("FRANCHISE_TAG");
    expect(state.franchiseTags[playerId]?.season).toBe(nextSeason);

    state = gameReducer(state, { type: "EXPIRE_EXPIRING_CONTRACTS_TO_FA", payload: { nextSeason } });
    expect((state.playerTeamOverrides[playerId] ?? teamId)).toBe(teamId);
    expect(getEffectiveFreeAgents(state).some((p) => String((p as any).playerId) === playerId)).toBe(false);

    const loaded = migrateSave(JSON.parse(JSON.stringify(state))) as GameState;
    expect(loaded.franchiseTags[playerId]?.season).toBe(nextSeason);
  });
});
