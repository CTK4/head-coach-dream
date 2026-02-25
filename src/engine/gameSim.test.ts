import { describe, expect, it } from "vitest";
import { computeDefensiveLook, initGameSim, recommendFourthDown, stepPlay } from "@/engine/gameSim";
import { mulberry32 } from "@/engine/rand";

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

describe("PAS engine + defensive look", () => {
  it("generates a valid defensive look", () => {
    const sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 42 });
    const rng = mulberry32(99);
    const look = computeDefensiveLook(sim, rng);
    expect(["TWO_HIGH", "SINGLE_HIGH"]).toContain(look.shell);
    expect(["LIGHT", "NORMAL", "HEAVY"]).toContain(look.box);
    expect(["NONE", "POSSIBLE", "LIKELY"]).toContain(look.blitz);
  });



  it("defensive look responds to down-and-distance game state", () => {
    const shortYardage = {
      ...initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 77 }),
      down: 1 as const,
      distance: 2,
      ballOn: 50,
    };
    const thirdAndLong = {
      ...shortYardage,
      down: 3 as const,
      distance: 11,
    };

    const heavyLook = computeDefensiveLook(shortYardage, () => 0.01);
    const longYardageLook = computeDefensiveLook(thirdAndLong, () => 0.01);

    expect(heavyLook.box).toBe("HEAVY");
    expect(longYardageLook.shell).toBe("TWO_HIGH");
  });
  it("stepPlay with granular play types produces result tags in driveLog", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 7 });
    sim = stepPlay(sim, "INSIDE_ZONE").sim;
    expect(sim.driveLog.length).toBe(1);
    expect(sim.driveLog[0].resultTags).toBeDefined();
  });

  it("full game with granular plays ends at Q4 0:00", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 55 });
    let safety = 0;
    while (!(sim.clock.quarter === 4 && sim.clock.timeRemainingSec === 0)) {
      sim = stepPlay(sim, "DROPBACK").sim;
      safety += 1;
      if (safety > 6000) break;
    }
    expect(sim.clock.quarter).toBe(4);
    expect(sim.clock.timeRemainingSec).toBe(0);
  });

  it("game stats accumulate rushing and passing yards", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 3 });
    for (let i = 0; i < 20; i++) {
      sim = stepPlay(sim, i % 2 === 0 ? "INSIDE_ZONE" : "QUICK_GAME").sim;
    }
    const totalRush = sim.stats.home.rushYards + sim.stats.away.rushYards;
    const totalPass = sim.stats.home.passYards + sim.stats.away.passYards;
    expect(totalRush + totalPass).toBeGreaterThan(0);
  });

  it("defLook is set after stepPlay", () => {
    let sim = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 9 });
    sim = stepPlay(sim, "QUICK_GAME").sim;
    expect(sim.defLook).toBeDefined();
    expect(sim.defLook?.shell).toBeDefined();
  });
});
