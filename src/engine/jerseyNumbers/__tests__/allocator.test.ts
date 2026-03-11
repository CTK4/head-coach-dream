import { describe, expect, it } from "vitest";
import type { GameState } from "@/context/GameContext";
import { allocateJerseyNumber } from "@/engine/jerseyNumbers/allocate";
import { assignTeamRosterNumbers } from "@/engine/jerseyNumbers/assignTeamRoster";
import { getPlayers } from "@/data/leagueDb";

function baseState(): GameState {
  return {
    playerAgingDeltasById: {},
    playerAgeOffsetById: {},
    playerAttributeDeltasById: {},
    playerSnapCountsById: {},
    playerProgressionSeasonStatsById: {},
    playerDevelopmentById: {},
    playerAttrOverrides: {},
    playerTeamOverrides: {},
    franchiseTags: {},
    rookies: [],
  } as unknown as GameState;
}

function findPlayer(teamId: string, pos: string | string[]): string {
  const wanted = Array.isArray(pos) ? pos : [pos];
  const found = getPlayers().find((p) => String(p.teamId) === teamId && wanted.includes(String(p.pos).toUpperCase()));
  if (!found) throw new Error(`Unable to find ${pos} on ${teamId}`);
  return String(found.playerId);
}

describe("jersey number allocator", () => {
  it("prefers QB #10 over #19 when available", () => {
    const teamId = String(getPlayers().find((p) => String(p.pos).toUpperCase() === "QB")?.teamId);
    const qbId = findPlayer(teamId, "QB");
    const n = allocateJerseyNumber({ state: baseState(), teamId, playerId: qbId, posGroup: "QB" });
    expect(n).toBe(10);
  });

  it("prefers RB/DB #22 over #29 when available", () => {
    const teamId = String(getPlayers().find((p) => ["RB", "HB", "FB"].includes(String(p.pos).toUpperCase()))?.teamId);
    const rbId = findPlayer(teamId, ["RB", "HB", "FB"]);
    const n = allocateJerseyNumber({ state: baseState(), teamId, playerId: rbId, posGroup: "RB" });
    expect(n).toBe(22);
  });



  it("reassigns on team change when destination already uses the number", () => {
    const teamA = String(getPlayers().find((p) => String(p.pos).toUpperCase() === "QB")?.teamId);
    const teamB = String(getPlayers().find((p) => String(p.pos).toUpperCase() === "QB" && String(p.teamId) !== teamA)?.teamId);
    const qbA = findPlayer(teamA, "QB");
    const qbB = findPlayer(teamB, "QB");

    const moved: GameState = {
      ...baseState(),
      playerTeamOverrides: { [qbA]: teamB, [qbB]: teamB },
      playerAttrOverrides: { [qbA]: { jerseyNumber: 10 }, [qbB]: { jerseyNumber: 10 } },
    } as GameState;

    const assigned = assignTeamRosterNumbers(moved, teamB);
    expect(assigned[qbB]).toBe(10);
    expect(assigned[qbA]).toBe(12);
  });

  it("assigns no duplicates in deterministic batch", () => {
    const roster = getPlayers();
    const seedTeamId = String(roster.find((p) => ["QB", "RB", "CB", "WR"].includes(String(p.pos).toUpperCase()))?.teamId);
    const s = baseState();
    const a = assignTeamRosterNumbers(s, seedTeamId);
    const b = assignTeamRosterNumbers(s, seedTeamId);
    expect(a).toEqual(b);
    const values = Object.values(a);
    expect(new Set(values).size).toBe(values.length);
  });
});
