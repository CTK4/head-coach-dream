import { describe, expect, it, vi } from "vitest";
import { runDevAction } from "@/dev/runDevAction";

vi.mock("@/data/leagueDb", () => ({
  getPlayers: vi.fn(),
}));

import { getPlayers } from "@/data/leagueDb";

function buildState(overrides: Record<string, string> = {}) {
  return {
    saveSeed: 123,
    season: 2026,
    week: 1,
    acceptedOffer: { teamId: "HOME" },
    playerTeamOverrides: overrides,
    offseasonData: {
      freeAgency: {
        offers: [],
        signings: [],
        rejected: {},
        withdrawn: {},
        capTotal: 0,
        capUsed: 0,
        capHitsByPlayerId: {},
        decisionReasonByPlayerId: {},
      },
    },
  } as any;
}

describe("runDevAction SPAWN_FREE_AGENTS", () => {
  it("does not re-select players that already have a playerTeamOverride", () => {
    vi.mocked(getPlayers).mockReturnValue([
      { playerId: "P1", teamId: "TEAM_A" },
      { playerId: "P2", teamId: "TEAM_B" },
    ] as any);

    const state = buildState({ P1: "OVERRIDE_TEAM" });
    const next = runDevAction(state, "SPAWN_FREE_AGENTS", { count: 2 });

    expect(next.playerTeamOverrides.P1).toBe("OVERRIDE_TEAM");
    expect(next.playerTeamOverrides.P2).toBe("");
  });
});
