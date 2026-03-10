import { describe, expect, it } from "vitest";
import { getTeams } from "@/data/leagueDb";
import { simulateFullGame } from "@/engine/gameSim";

function testTeams() {
  return getTeams()
    .filter((team) => team.isActive !== false)
    .slice(0, 2)
    .map((team) => team.teamId) as [string, string];
}

describe("telemetry pass diagnostics determinism", () => {
  it("produces deterministic pass diagnostics from deterministic seeds", () => {
    const [homeTeamId, awayTeamId] = testTeams();
    const seed = 96021;

    const simA = simulateFullGame({ homeTeamId, awayTeamId, seed, includePlayLog: true });
    const simB = simulateFullGame({ homeTeamId, awayTeamId, seed, includePlayLog: true });

    const passDiagA = (simA.playLog ?? []).map((event) => event.passDiag ?? null);
    const passDiagB = (simB.playLog ?? []).map((event) => event.passDiag ?? null);

    expect(passDiagA.length).toBeGreaterThan(0);
    expect(passDiagA).toEqual(passDiagB);
    expect(passDiagA.some((diag) => diag !== null)).toBe(true);
  });
});
