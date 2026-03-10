import { afterEach, describe, expect, it } from "vitest";
import { gameReducer, type GameState } from "@/context/GameContext";
import { getContractById, getPlayerById, getPlayers, getTeamById, upsertContract } from "@/data/leagueDb";
import { getEffectiveFreeAgents } from "@/engine/rosterOverlay";

type RestoreItem = { playerId: string; teamId: string; status: string; contract: Record<string, unknown> };
const restoreItems: RestoreItem[] = [];

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

function snapshotPlayer(playerId: string) {
  const player = getPlayerById(playerId) as any;
  const contract = getContractById(String(player?.contractId ?? ""));
  if (!player || !contract) throw new Error(`Missing player or contract for ${playerId}`);
  restoreItems.push({
    playerId,
    teamId: String(player.teamId ?? ""),
    status: String(player.status ?? "ACTIVE"),
    contract: { ...contract },
  });
}

function setContractEndSeason(playerId: string, endSeason: number) {
  const player = getPlayerById(playerId) as any;
  const contract = getContractById(String(player?.contractId ?? ""));
  if (!player || !contract) throw new Error(`Missing player or contract for ${playerId}`);
  player.status = "ACTIVE";
  contract.endSeason = endSeason;
  contract.isExpired = false;
  contract.teamId = String(player.teamId ?? contract.teamId ?? "");
  upsertContract(contract);
}

afterEach(() => {
  while (restoreItems.length > 0) {
    const item = restoreItems.pop()!;
    const player = getPlayerById(item.playerId) as any;
    if (player) {
      player.teamId = item.teamId;
      player.status = item.status;
    }
    upsertContract(item.contract as any);
  }
});

describe("franchise tag", () => {
  it("tags an eligible expiring player, creates next-season override, and excludes from FA pool", () => {
    const candidate = getPlayers().find((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();

    const playerId = String((candidate as any).playerId);
    const teamId = String((candidate as any).teamId);
    snapshotPlayer(playerId);

    const state = initStateForTeam(teamId);
    setContractEndSeason(playerId, state.season);

    const next = gameReducer(state, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    const override = next.playerContractOverrides[playerId];
    const nextSeason = state.season + 1;

    expect(override).toBeTruthy();
    expect(override.startSeason).toBe(nextSeason);
    expect(override.endSeason).toBe(nextSeason);
    expect(override.contractType).toBe("FRANCHISE_TAG");
    expect(next.franchiseTags[playerId]?.season).toBe(nextSeason);
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === playerId)).toBe(false);
  });

  it("rejects ineligible players (non-expiring or already tagged)", () => {
    const candidate = getPlayers().find((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();

    const playerId = String((candidate as any).playerId);
    const teamId = String((candidate as any).teamId);
    snapshotPlayer(playerId);

    const state = initStateForTeam(teamId);
    setContractEndSeason(playerId, state.season + 2);

    const nonExpiringAttempt = gameReducer(state, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    expect(nonExpiringAttempt.franchiseTags[playerId]).toBeUndefined();
    expect(nonExpiringAttempt.hub.news[0]?.title).toContain("Franchise tag failed");

    setContractEndSeason(playerId, state.season);
    const tagged = gameReducer(state, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    const duplicate = gameReducer(tagged, { type: "APPLY_FRANCHISE_TAG", payload: { playerId } });
    expect(duplicate.franchiseTags[playerId]?.timesUsed).toBe(1);
    expect(duplicate.hub.news[0]?.title).toContain("TAG_ALREADY_APPLIED");
  });
});
