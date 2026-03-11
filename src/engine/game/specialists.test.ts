import { describe, expect, it } from "vitest";
import { gameReducer, migrateSave, type GameState } from "@/context/GameContext";
import { resolveMigratedSpecialistsBySide } from "@/context/boot/migrateSave";
import { getPlayers } from "@/data/leagueDb";
import { getEffectivePlayersByTeam } from "@/engine/rosterOverlay";
import { resolveSpecialistsBySide } from "@/engine/game/specialists";

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

describe("specialist resolver", () => {
  it("preserves valid depth starters, falls back for invalid slots, and backfills missing slots independently", () => {
    const base = initState();
    const homeTeamId = String(base.acceptedOffer?.teamId ?? "");
    const awayTeamId = String(getPlayers().find((p: any) => String(p.teamId) !== homeTeamId)?.teamId ?? "");

    const homeK = getEffectivePlayersByTeam(base, homeTeamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase() === "K")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0] as any;
    const homeP = getEffectivePlayersByTeam(base, homeTeamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase() === "P")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0] as any;
    const awayP = getEffectivePlayersByTeam(base, awayTeamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase() === "P")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0] as any;
    const invalidAwayK = getEffectivePlayersByTeam(base, awayTeamId)
      .find((p: any) => String(p.pos ?? "").toUpperCase() !== "K") as any;

    const resolved = resolveSpecialistsBySide(base, {
      homeTeamId,
      awayTeamId,
      existingBySide: { HOME: { K: String(homeK?.playerId ?? "") }, AWAY: { P: String(awayP?.playerId ?? "") } },
      homeDepthStarterIds: { K: String(homeK?.playerId ?? "") },
      awayDepthStarterIds: { K: String(invalidAwayK?.playerId ?? "") },
      homeActivePlayerIds: new Set(Object.keys(base.rosterMgmt.active ?? {})),
    });

    expect(String(resolved.HOME.K ?? "")).toBe(String(homeK?.playerId ?? ""));
    expect(String(resolved.HOME.P ?? "")).toBe(String(homeP?.playerId ?? ""));
    expect(String(resolved.AWAY.P ?? "")).toBe(String(awayP?.playerId ?? ""));
    expect(String(resolved.AWAY.K ?? "")).not.toBe(String(invalidAwayK?.playerId ?? ""));
  });

  it("runtime and migration specialist resolvers stay aligned from the same raw state input", () => {
    const base = initState();
    const homeTeamId = String(base.acceptedOffer?.teamId ?? "");
    const awayTeamId = String(getPlayers().find((p: any) => String(p.teamId) !== homeTeamId)?.teamId ?? "");

    const raw = {
      ...base,
      game: { ...base.game, homeTeamId, awayTeamId, specialistsBySide: { HOME: {}, AWAY: {} } } as any,
    } as GameState;

    const runtimeResolved = resolveSpecialistsBySide(raw, {
      homeTeamId,
      awayTeamId,
      existingBySide: raw.game.specialistsBySide as any,
      homeDepthStarterIds: {
        K: String(raw.depthChart?.startersByPos?.K ?? ""),
        P: String(raw.depthChart?.startersByPos?.P ?? ""),
      },
      awayDepthStarterIds: {
        K: String(raw.leagueDepthCharts?.[awayTeamId]?.startersByPos?.K ?? ""),
        P: String(raw.leagueDepthCharts?.[awayTeamId]?.startersByPos?.P ?? ""),
      },
      homeActivePlayerIds: new Set(Object.keys(raw.rosterMgmt.active ?? {})),
    });

    const migrationResolved = resolveMigratedSpecialistsBySide(raw, raw.game as any);

    expect(migrationResolved).toEqual(runtimeResolved);

    const migrated = migrateSave(raw) as GameState;
    expect(migrated.game.specialistsBySide).toEqual(runtimeResolved);
  });

  it("uses soft active-roster fallback when no active specialist exists", () => {
    const base = initState();
    const homeTeamId = String(base.acceptedOffer?.teamId ?? "");
    const awayTeamId = String(getPlayers().find((p: any) => String(p.teamId) !== homeTeamId)?.teamId ?? "");
    const topHomeK = getEffectivePlayersByTeam(base, homeTeamId)
      .filter((p: any) => String(p.pos ?? "").toUpperCase() === "K")
      .sort((a: any, b: any) => Number(b.overall ?? 0) - Number(a.overall ?? 0))[0] as any;

    const resolved = resolveSpecialistsBySide(base, {
      homeTeamId,
      awayTeamId,
      homeActivePlayerIds: new Set([String(base.trackedPlayersByTeam?.[homeTeamId]?.QB ?? "__none__")]),
    });

    expect(String(resolved.HOME.K ?? "")).toBe(String(topHomeK?.playerId ?? ""));
  });
});
