import { describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getTeamById } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { buildRosterIndex } from "@/engine/transactions/applyTransactions";
import { buildContractReleaseAction } from "@/pages/hub/PlayerContractScreen";

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
  return gameReducer(seeded, {
    type: "INIT_FREE_PLAY_CAREER",
    payload: { teamId, teamName },
  });
}

describe("contracts: release routing", () => {
  it("routes contract-screen release to CUT_APPLY so ledger, rosterIndex, and effective roster stay aligned", () => {
    const base = initStateForTeam("MILWAUKEE_NORTHSHORE");
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const player = getEffectivePlayersByTeam(base, teamId)[0];

    expect(player).toBeTruthy();

    const next = gameReducer(
      base,
      buildContractReleaseAction({
        teamId,
        playerId: String(player.playerId),
        designation: "PRE_JUNE_1",
      }),
    );

    const lastLedgerEvent = next.transactionLedger?.events?.at(-1);
    expect(lastLedgerEvent?.kind).toBe("CUT");
    expect(lastLedgerEvent?.playerIds).toContain(String(player.playerId));

    const rosterIndex = buildRosterIndex(next);
    expect(rosterIndex.playerToTeam[String(player.playerId)]).toBe("FREE_AGENT");

    const remainingTeamPlayerIds = getEffectivePlayersByTeam(next, teamId).map((p: any) => String(p.playerId));
    expect(remainingTeamPlayerIds).not.toContain(String(player.playerId));
  });
});
