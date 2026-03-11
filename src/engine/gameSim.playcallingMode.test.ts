import { describe, expect, it } from "vitest";
import { initGameSim, stepPlay, type GameSim, type PlayType } from "@/engine/gameSim";

type DriveTerminalReason = "POSSESSION_CHANGE" | "SCORE" | "PERIOD_OR_GAME_END";

type DriveRunResult = {
  sim: GameSim;
  safetyCounter: number;
  terminated: boolean;
  terminalReason?: DriveTerminalReason;
};

function runDriveUntilTerminal(
  start: GameSim,
  selector: (sim: GameSim, snap: number) => PlayType,
  maxSnaps = 200,
): DriveRunResult {
  const initialPossession = start.possession;
  const initialDrive = start.driveNumber;
  const initialQuarter = start.clock.quarter;
  const initialHomeScore = start.homeScore;
  const initialAwayScore = start.awayScore;

  let sim = start;
  let safetyCounter = 0;

  while (safetyCounter < maxSnaps) {
    const before = sim;
    const stepped = stepPlay(sim, selector(sim, safetyCounter));
    sim = stepped.sim;
    safetyCounter += 1;

    // Coherency: drives/plays move forward in a predictable way.
    if (sim.driveNumber === before.driveNumber) {
      expect(sim.playNumberInDrive).toBe(before.playNumberInDrive + 1);
    } else {
      expect(sim.driveNumber).toBe(before.driveNumber + 1);
      expect(sim.playNumberInDrive).toBe(1);
    }

    // Coherency: clock never rewinds within a quarter; quarter only advances.
    expect(Number(sim.clock.quarter)).toBeGreaterThanOrEqual(Number(before.clock.quarter));
    if (sim.clock.quarter === before.clock.quarter) {
      expect(sim.clock.timeRemainingSec).toBeLessThanOrEqual(before.clock.timeRemainingSec);
    }

    const possessionChanged = sim.possession !== initialPossession || sim.driveNumber !== initialDrive;
    if (possessionChanged) {
      return { sim, safetyCounter, terminated: true, terminalReason: "POSSESSION_CHANGE" };
    }

    const scored = sim.homeScore !== initialHomeScore || sim.awayScore !== initialAwayScore;
    if (scored) {
      return { sim, safetyCounter, terminated: true, terminalReason: "SCORE" };
    }

    const periodOrGameEnd = sim.clock.quarter !== initialQuarter || stepped.ended;
    if (periodOrGameEnd) {
      return { sim, safetyCounter, terminated: true, terminalReason: "PERIOD_OR_GAME_END" };
    }
  }

  return { sim, safetyCounter, terminated: false };
}

describe("playcalling mode drive termination", () => {
  it("terminates a user-controlled drive with deterministic selector and coherent state progression", () => {
    let selectorIndex = 0;
    const fixedSequence: PlayType[] = ["INSIDE_ZONE", "QUICK_GAME", "DROPBACK", "OUTSIDE_ZONE"];

    const sim = initGameSim({
      homeTeamId: "USER",
      awayTeamId: "CPU",
      seed: 123456,
      offenseUserMode: "FULL_PLAYCALLING",
    });

    const result = runDriveUntilTerminal(sim, () => {
      const pick = fixedSequence[selectorIndex % fixedSequence.length];
      selectorIndex += 1;
      return pick;
    });

    expect(result.terminated).toBe(true);
    expect(result.safetyCounter).toBeGreaterThan(0);
    expect(result.safetyCounter).toBeLessThan(200);
    expect(result.terminalReason).toBeDefined();
  });

  it("terminates correctly when selector forces edge-case 4th-down FG/PUNT calls", () => {
    const sim = initGameSim({
      homeTeamId: "USER",
      awayTeamId: "CPU",
      seed: 654321,
      offenseUserMode: "FULL_PLAYCALLING",
    });

    const result = runDriveUntilTerminal(sim, (s) => {
      if (s.down === 4) {
        return s.ballOn >= 57 ? "FG" : "PUNT";
      }
      return "RUN";
    });

    expect(result.terminated).toBe(true);
    expect(result.safetyCounter).toBeGreaterThan(0);
    expect(result.safetyCounter).toBeLessThan(200);
    expect(["POSSESSION_CHANGE", "SCORE", "PERIOD_OR_GAME_END"]).toContain(result.terminalReason);
  });
});
