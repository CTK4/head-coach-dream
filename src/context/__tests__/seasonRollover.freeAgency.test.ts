import { afterEach, describe, expect, it } from "vitest";
import { gameReducer, type GameState, type PlayerContractOverride } from "@/context/GameContext";
import { getContractById, getPlayerById, getPlayers, getTeamById, upsertContract } from "@/data/leagueDb";
import { getEffectiveFreeAgents, getEffectivePlayersByTeam } from "@/engine/rosterOverlay";

type RestoreItem = {
  playerId: string;
  teamId: string;
  status: string;
  contract: Record<string, unknown>;
};

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
  return gameReducer(seeded, {
    type: "INIT_FREE_PLAY_CAREER",
    payload: { teamId, teamName },
  });
}

function snapshotPlayer(playerId: string) {
  const player = getPlayerById(playerId);
  const contract = getContractById(String((player as any)?.contractId ?? ""));
  if (!player || !contract) throw new Error(`Missing player or contract for ${playerId}`);
  restoreItems.push({
    playerId,
    teamId: String((player as any).teamId ?? ""),
    status: String((player as any).status ?? "ACTIVE"),
    contract: { ...contract },
  });
}

function setContractToExpireThisSeason(playerId: string, season: number) {
  const player = getPlayerById(playerId) as any;
  const contract = getContractById(String(player?.contractId ?? ""));
  if (!player || !contract) throw new Error(`Missing player or contract for ${playerId}`);

  player.status = "ACTIVE";
  contract.endSeason = season;
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

describe("season rollover free agency handling", () => {
  it("moves base-contract expirations to free agency", () => {
    const candidate = getPlayers().find((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();
    const playerId = String((candidate as any).playerId);
    const teamId = String((candidate as any).teamId);

    snapshotPlayer(playerId);

    const state = initStateForTeam(teamId);
    setContractToExpireThisSeason(playerId, state.season);

    const next = gameReducer(
      {
        ...state,
        playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: teamId },
        playerContractOverrides: Object.fromEntries(Object.entries(state.playerContractOverrides).filter(([pid]) => pid !== playerId)),
      },
      { type: "ADVANCE_SEASON" },
    );

    expect(next.playerTeamOverrides[playerId]).toBe("FREE_AGENT");
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === playerId)).toBe(true);
    expect(getEffectivePlayersByTeam(next, teamId).some((p: any) => String(p.playerId) === playerId)).toBe(false);
  });

  it("keeps re-signed players on roster when override covers next season", () => {
    const candidate = getPlayers().find((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();
    const playerId = String((candidate as any).playerId);
    const teamId = String((candidate as any).teamId);

    snapshotPlayer(playerId);

    const state = initStateForTeam(teamId);
    setContractToExpireThisSeason(playerId, state.season);

    const override: PlayerContractOverride = {
      startSeason: state.season + 1,
      endSeason: state.season + 3,
      salaries: [8_000_000, 9_000_000, 10_000_000],
      signingBonus: 0,
      guaranteedTotal: 0,
      source: "USER_SIGN",
      signedAt: Date.now(),
    };

    const next = gameReducer(
      {
        ...state,
        playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: teamId },
        playerContractOverrides: { ...state.playerContractOverrides, [playerId]: override },
      },
      { type: "ADVANCE_SEASON" },
    );

    expect(next.playerTeamOverrides[playerId]).toBe(teamId);
    expect(getEffectivePlayersByTeam(next, teamId).some((p: any) => String(p.playerId) === playerId)).toBe(true);
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === playerId)).toBe(false);
  });

  it("does not change players already in free agency", () => {
    const candidate = getPlayers().find((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? "")));
    expect(candidate).toBeTruthy();
    const playerId = String((candidate as any).playerId);
    const teamId = String((candidate as any).teamId);

    snapshotPlayer(playerId);

    const state = initStateForTeam(teamId);
    setContractToExpireThisSeason(playerId, state.season);

    const next = gameReducer(
      {
        ...state,
        playerTeamOverrides: { ...state.playerTeamOverrides, [playerId]: "FREE_AGENT" },
      },
      { type: "ADVANCE_SEASON" },
    );

    expect(next.playerTeamOverrides[playerId]).toBe("FREE_AGENT");
    expect(getEffectiveFreeAgents(next).some((p: any) => String(p.playerId) === playerId)).toBe(true);
  });

  it("increases free-agent pool when multiple base contracts expire", () => {
    const candidates = getPlayers().filter((p: any) => String(p.teamId ?? "") !== "FREE_AGENT" && !!getContractById(String(p.contractId ?? ""))).slice(0, 3);
    expect(candidates.length).toBe(3);

    const teamId = String((candidates[0] as any).teamId);
    const playerIds = candidates.map((p: any) => String(p.playerId));

    for (const playerId of playerIds) snapshotPlayer(playerId);

    const state = initStateForTeam(teamId);
    for (const playerId of playerIds) setContractToExpireThisSeason(playerId, state.season);

    const before = getEffectiveFreeAgents(state).length;
    const next = gameReducer(state, { type: "ADVANCE_SEASON" });
    const after = getEffectiveFreeAgents(next).length;

    expect(after).toBeGreaterThanOrEqual(before + playerIds.length);
    for (const playerId of playerIds) {
      expect(next.playerTeamOverrides[playerId]).toBe("FREE_AGENT");
    }
  });
});
