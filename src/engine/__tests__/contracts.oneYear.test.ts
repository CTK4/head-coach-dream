import { describe, expect, it } from "vitest";
import { gameReducer, createInitialStateForTests, migrateSave, type GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";

const hashState = (s: GameState) => JSON.stringify(s).length;

function firstRosterPlayer() {
  const p = getPlayers().find((x: any) => String(x.teamId ?? "") && String(x.teamId) !== "FREE_AGENT");
  if (!p) throw new Error("no roster player");
  return { playerId: String((p as any).playerId), teamId: String((p as any).teamId) };
}

describe("contracts one-year re-sign", () => {
  it("creates next-season override ending in start season and survives roundtrip", () => {
    const { playerId, teamId } = firstRosterPlayer();
    let state = createInitialStateForTests();
    state = { ...state, teamId, userTeamId: teamId, acceptedOffer: { ...(state.acceptedOffer ?? ({} as any)), teamId } as any };
    const beforeHash = hashState(state);

    state = gameReducer(state, {
      type: "RESIGN_SET_DECISION",
      payload: {
        playerId,
        decision: { action: "RESIGN", offer: { years: 1, apy: 9_000_000, guaranteesPct: 0.5, discountPct: 0, createdFrom: "RESIGN_SCREEN", rejectedCount: 0 } },
      },
    });
    state = gameReducer(state, { type: "RESIGN_ACCEPT_OFFER", payload: { playerId } });

    const override = state.playerContractOverrides[playerId];
    expect(override).toBeTruthy();
    expect(override.startSeason).toBe(state.season + 1);
    expect(override.endSeason).toBe(override.startSeason);
    expect(hashState(state)).not.toBe(beforeHash);

    const loaded = migrateSave(JSON.parse(JSON.stringify(state))) as GameState;
    expect(loaded.playerContractOverrides[playerId]?.endSeason).toBe(override.startSeason);
  });
});
