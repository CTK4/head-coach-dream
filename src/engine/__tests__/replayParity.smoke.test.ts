import { describe, expect, it } from "vitest";
import { getTeams } from "@/data/leagueDb";
import { autoPickPlay, initGameSim, simulateFullGame, stepPlay, type GameSim } from "@/engine/gameSim";

type JsonLike = null | boolean | number | string | JsonLike[] | { [k: string]: JsonLike };

function canonicalize(value: JsonLike): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((v) => canonicalize(v)).join(",")}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize((value as Record<string, JsonLike>)[k])}`).join(",")}}`;
}

function fnv1a(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function snapFingerprint(sim: GameSim) {
  return {
    score: `${sim.homeScore}-${sim.awayScore}`,
    possession: sim.possession,
    down: sim.down,
    distance: sim.distance,
    ballOn: sim.ballOn,
    quarter: sim.clock.quarter,
    timeRemainingSec: sim.clock.timeRemainingSec,
    driveNumber: sim.driveNumber,
    playNumberInDrive: sim.playNumberInDrive,
    seed: sim.seed,
    lastResult: sim.lastResult,
  } as const;
}

describe("replay parity smoke", () => {
  it("keeps one-game action sequence hash-identical for twin clones", () => {
    const [home, away] = getTeams()
      .filter((team) => team.isActive !== false)
      .slice(0, 2)
      .map((team) => team.teamId);

    const seed = 44017;
    let left = initGameSim({ homeTeamId: home, awayTeamId: away, seed });
    let right = initGameSim({ homeTeamId: home, awayTeamId: away, seed });

    left = { ...left, clock: { ...left.clock, clockRunning: false, restartMode: "SNAP" } };
    right = { ...right, clock: { ...right.clock, clockRunning: false, restartMode: "SNAP" } };

    const leftTrace: JsonLike[] = [];
    const rightTrace: JsonLike[] = [];

    let safety = 0;
    while (!(left.clock.quarter === 4 && left.clock.timeRemainingSec === 0) && safety < 6000) {
      const playType = autoPickPlay(left);

      const leftStep = stepPlay(left, playType);
      const rightStep = stepPlay(right, playType);

      left = leftStep.sim;
      right = rightStep.sim;

      leftTrace.push({ playType, snap: snapFingerprint(left) });
      rightTrace.push({ playType, snap: snapFingerprint(right) });
      safety += 1;
    }

    const leftHash = fnv1a(canonicalize(leftTrace));
    const rightHash = fnv1a(canonicalize(rightTrace));

    expect(rightHash).toBe(leftHash);
    expect(right).toEqual(left);

    const fullGameA = simulateFullGame({ homeTeamId: home, awayTeamId: away, seed });
    const fullGameB = simulateFullGame({ homeTeamId: home, awayTeamId: away, seed });
    expect(fullGameB).toEqual(fullGameA);
  });
});
