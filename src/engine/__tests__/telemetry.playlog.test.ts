import { describe, expect, it } from "vitest";
import { getTeams } from "@/data/leagueDb";
import { autoPickPlay, initGameSim, simulateFullGame, stepPlay } from "@/engine/gameSim";

function testTeams() {
  return getTeams()
    .filter((team) => team.isActive !== false)
    .slice(0, 2)
    .map((team) => team.teamId) as [string, string];
}

describe("telemetry play log", () => {
  it("emits non-empty deterministic play logs and keeps legacy return shape", () => {
    const [homeTeamId, awayTeamId] = testTeams();
    const seed = 73291;

    const withLogA = simulateFullGame({ homeTeamId, awayTeamId, seed, includePlayLog: true });
    const withLogB = simulateFullGame({ homeTeamId, awayTeamId, seed, includePlayLog: true });
    const legacy = simulateFullGame({ homeTeamId, awayTeamId, seed });

    expect(withLogA.playLog?.length).toBeGreaterThan(0);
    expect(withLogA).toEqual(withLogB);
    expect(legacy).toEqual({ homeScore: withLogA.homeScore, awayScore: withLogA.awayScore });
    expect("playLog" in legacy).toBe(false);
  });

  it("keeps monotonic playIndex and one event per executed snap", () => {
    const [homeTeamId, awayTeamId] = testTeams();
    let sim = initGameSim({ homeTeamId, awayTeamId, seed: 40417 });
    sim = { ...sim, clock: { ...sim.clock, clockRunning: false, restartMode: "SNAP" } };

    let safety = 0;
    while (!(sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0) && safety < 6000) {
      const stepped = stepPlay(sim, autoPickPlay(sim));
      sim = stepped.sim;
      safety += 1;
    }

    const playLog = sim.playLog;
    expect(playLog.length).toBe(sim.driveLog.length);
    for (let i = 0; i < playLog.length; i += 1) {
      expect(playLog[i]?.playIndex).toBe(i + 1);
      if (i > 0) expect(playLog[i]!.playIndex).toBeGreaterThan(playLog[i - 1]!.playIndex);
    }
  });
  it("emits pass diagnostics only for pass-play events when available", () => {
    const [homeTeamId, awayTeamId] = testTeams();
    const withLog = simulateFullGame({ homeTeamId, awayTeamId, seed: 84210, includePlayLog: true });
    const passPlays = new Set(["QUICK_GAME", "DROPBACK", "SCREEN", "PLAY_ACTION", "SHORT_PASS", "DEEP_PASS"]);

    let passDiagCount = 0;
    for (const event of withLog.playLog ?? []) {
      if (!passPlays.has(event.playType)) {
        expect(event.passDiag).toBeUndefined();
      } else if (event.passDiag) {
        passDiagCount += 1;
      }
    }

    expect(passDiagCount).toBeGreaterThan(0);
  });

});
