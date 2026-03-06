import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { applySeasonBadges, evaluatePlayerBadges } from "@/engine/badges/engine";

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

describe("badges engine", () => {
  it("awards badge when threshold is met", () => {
    const base = initState();
    const qb = getPlayers().find((p: any) => String(p.pos ?? "").toUpperCase() === "QB");
    expect(qb).toBeTruthy();
    const playerId = String((qb as any).playerId);
    const season = base.season;
    const state: GameState = {
      ...base,
      playerSeasonStatsById: {
        ...base.playerSeasonStatsById,
        [playerId]: [{ season, teamId: String((qb as any).teamId ?? ""), gamesPlayed: 17, passingYards: 4700, passingTDs: 39 } as any],
      },
      playerProgressionSeasonStatsById: {
        ...base.playerProgressionSeasonStatsById,
        [playerId]: { gamesPlayed: 17, starts: 17, performanceScore: 0.9 },
      },
    };

    const earned = evaluatePlayerBadges(state, playerId, season);
    expect(earned.some((b) => b.badgeId === "GUNSLINGER")).toBe(true);
  });

  it("does not re-award existing badge", () => {
    const base = initState();
    const qb = getPlayers().find((p: any) => String(p.pos ?? "").toUpperCase() === "QB");
    const playerId = String((qb as any).playerId);
    const season = base.season;
    const state: GameState = {
      ...base,
      playerBadges: {
        ...base.playerBadges,
        [playerId]: [{ badgeId: "GUNSLINGER", awardedSeason: season - 1, level: 2 }],
      },
      playerSeasonStatsById: {
        ...base.playerSeasonStatsById,
        [playerId]: [{ season, teamId: String((qb as any).teamId ?? ""), gamesPlayed: 17, passingYards: 5000, passingTDs: 45 } as any],
      },
    };

    const earned = evaluatePlayerBadges(state, playerId, season);
    expect(earned.some((b) => b.badgeId === "GUNSLINGER")).toBe(false);
  });

  it("eligibility gate blocks award", () => {
    const base = initState();
    const wr = getPlayers().find((p: any) => String(p.pos ?? "").toUpperCase() === "WR");
    expect(wr).toBeTruthy();
    const playerId = String((wr as any).playerId);
    const season = base.season;
    const state: GameState = {
      ...base,
      playerSeasonStatsById: {
        ...base.playerSeasonStatsById,
        [playerId]: [{ season, teamId: String((wr as any).teamId ?? ""), gamesPlayed: 17, passingYards: 5000, passingTDs: 45 } as any],
      },
    };

    const earned = evaluatePlayerBadges(state, playerId, season);
    expect(earned.some((b) => b.badgeId === "GUNSLINGER")).toBe(false);
  });

  it("rare or higher badge appends news", () => {
    const base = initState();
    const qb = getPlayers().find((p: any) => String(p.pos ?? "").toUpperCase() === "QB");
    const playerId = String((qb as any).playerId);
    const season = base.season;
    const state: GameState = {
      ...base,
      playerSeasonStatsById: {
        ...base.playerSeasonStatsById,
        [playerId]: [{ season, teamId: String((qb as any).teamId ?? ""), gamesPlayed: 17, passingYards: 4700, passingTDs: 39 } as any],
      },
    };

    const next = applySeasonBadges(state);
    expect((next.hub.news ?? []).some((n) => String(n.title).includes("Gunslinger"))).toBe(true);
  });

  it("save migration adds empty playerBadges map", () => {
    const base = initState();
    const migrated = migrateSave({ ...base, playerBadges: undefined }) as GameState;
    expect(migrated.playerBadges).toEqual({});
  });
});
