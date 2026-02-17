import { describe, expect, it } from "vitest";
import { initGameSim, recommendFourthDown, stepPlay } from "@/engine/gameSim";

describe("clock sim + drive log", () => {
  it("advances time and ends by Q4 0:00", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 1 });
    let safety = 0;

    while (!(sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0)) {
      sim = stepPlay(sim, "RUN").sim;
      safety += 1;
      if (safety > 6000) break;
    }

    expect(sim.clock.quarter).toBe(4);
    expect(sim.clock.timeRemainingSec).toBe(0);
  });

  it("two-minute warning triggers in Q2/Q4 when crossing 2:00 with running clock", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 2 });
    sim = {
      ...sim,
      clock: { ...sim.clock, quarter: 2, timeRemainingSec: 125, clockRunning: true, restartMode: "READY" },
    };

    sim = stepPlay(sim, "RUN").sim;

    expect(sim.clock.twoMinuteUsedH1).toBe(true);
    expect(sim.clock.timeRemainingSec).toBeLessThanOrEqual(120);
  });

  it("records log entries", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 1 });
    sim = stepPlay(sim, "RUN").sim;
    sim = stepPlay(sim, "SHORT_PASS").sim;
    expect(sim.driveLog.length).toBe(2);
    expect(sim.driveLog[0].playType).toBe("SHORT_PASS");
  });
});

describe("4th down recommendations", () => {
  it("returns a ranked recommendation with breakeven in [0,1]", () => {
    const sim = { ...initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 1 }), down: 4 as const, distance: 4, ballOn: 62 };
    const rec = recommendFourthDown(sim);
    expect(rec.ranked.length).toBeGreaterThanOrEqual(3);
    expect(rec.breakevenGoRate).toBeGreaterThanOrEqual(0);
    expect(rec.breakevenGoRate).toBeLessThanOrEqual(1);
  });
});
