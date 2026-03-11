import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { getPlayers } from "@/data/leagueDb";
import { applySeasonBadges, evaluatePlayerBadges } from "@/engine/badges/engine";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";

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


  it("migration backfills specialists from save-state effective roster, not base DB", () => {
    const base = initState();
    const userTeamId = String(base.acceptedOffer?.teamId ?? "");
    const movedK = getPlayers()
      .filter((p: any) => String(p.teamId) !== userTeamId && String(p.pos ?? "").toUpperCase() === "K")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0] as any;
    expect(movedK).toBeTruthy();

    const migrated = migrateSave({
      ...base,
      playerTeamOverrides: { ...(base.playerTeamOverrides ?? {}), [String(movedK.playerId)]: userTeamId },
      game: {
        ...base.game,
        homeTeamId: userTeamId,
        awayTeamId: String(base.game.awayTeamId ?? ""),
        specialistsBySide: undefined,
      } as any,
    }) as GameState;

    const effectiveHome = getEffectivePlayersByTeam(migrated, userTeamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase() === "K")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0));
    const expectedHomeK = String((effectiveHome[0] as any)?.playerId ?? "");

    expect(String(migrated.game.specialistsBySide?.HOME?.K ?? "")).toBe(expectedHomeK);
  });

  it("migration backfills missing specialist slots independently and preserves valid slots", () => {
    const base = initState();
    const userTeamId = String(base.acceptedOffer?.teamId ?? "");
    const awayTeamId = String(getPlayers().find((p: any) => String(p.teamId) !== userTeamId)?.teamId ?? "");

    const topByPos = (teamId: string, pos: "K" | "P") =>
      getEffectivePlayersByTeam(base, teamId)
        .filter((p: any) => String(p.pos ?? "").toUpperCase() === pos)
        .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0] as any;

    const preservedHomeK = String(topByPos(userTeamId, "K")?.playerId ?? "");
    const expectedHomeP = String(topByPos(userTeamId, "P")?.playerId ?? "");
    const preservedAwayP = String(topByPos(awayTeamId, "P")?.playerId ?? "");
    const expectedAwayK = String(topByPos(awayTeamId, "K")?.playerId ?? "");

    const migrated = migrateSave({
      ...base,
      game: {
        ...base.game,
        homeTeamId: userTeamId,
        awayTeamId,
        specialistsBySide: {
          HOME: { K: preservedHomeK },
          AWAY: { P: preservedAwayP },
        },
      } as any,
    }) as GameState;

    expect(String(migrated.game.specialistsBySide?.HOME?.K ?? "")).toBe(preservedHomeK);
    expect(String(migrated.game.specialistsBySide?.HOME?.P ?? "")).toBe(expectedHomeP);
    expect(String(migrated.game.specialistsBySide?.AWAY?.P ?? "")).toBe(preservedAwayP);
    expect(String(migrated.game.specialistsBySide?.AWAY?.K ?? "")).toBe(expectedAwayK);
  });


  it("save migration adds empty playerBadges map", () => {
    const base = initState();
    const migrated = migrateSave({ ...base, playerBadges: undefined }) as GameState;
    expect(migrated.playerBadges).toEqual({});
  });
});
