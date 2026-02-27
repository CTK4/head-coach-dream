import { describe, expect, it } from "vitest";
import { autoPickPlay, initGameSim, stepPlay, type GameSim } from "@/engine/gameSim";

function runRate(sim: GameSim, snaps = 200): number {
  let runs = 0;
  for (let i = 0; i < snaps; i += 1) {
    const play = autoPickPlay({ ...sim, playNumberInDrive: i % 8, seed: sim.seed + i, distance: 5, down: 1 });
    if (play === "INSIDE_ZONE" || play === "OUTSIDE_ZONE" || play === "POWER" || play === "RUN") runs += 1;
  }
  return runs / snaps;
}

describe("gameplan integration", () => {
  it("RUN_HEAVY increases run selection rate", () => {
    const baseline = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 7, homeGameplan: { offensiveFocus: "BALANCED" } });
    const runHeavy = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 7, homeGameplan: { offensiveFocus: "RUN_HEAVY" } });
    expect(runRate(runHeavy)).toBeGreaterThan(runRate(baseline));
  });

  it("STOP_PASS lowers passing production", () => {
    let neutral = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 10 });
    let stopPass = initGameSim({ homeTeamId: "A", awayTeamId: "B", seed: 10, awayGameplan: { defensiveFocus: "STOP_PASS" } });

    for (let i = 0; i < 80; i += 1) {
      neutral = { ...neutral, down: 1, distance: 7 };
      stopPass = { ...stopPass, down: 1, distance: 7 };
      neutral = stepPlay(neutral, "QUICK_GAME").sim;
      stopPass = stepPlay(stopPass, "QUICK_GAME").sim;
    }

    expect(stopPass.stats.home.passYards).toBeLessThan(neutral.stats.home.passYards);
  });

  it("scripted opening is forced for first 5 snaps of first drive only", () => {
    const scripted = ["INSIDE_ZONE", "DROPBACK", "SCREEN", "POWER", "QUICK_GAME"] as const;
    const sim = initGameSim({
      homeTeamId: "A",
      awayTeamId: "B",
      seed: 3,
      homeGameplan: { scriptedOpening: [...scripted] },
    });

    // First 5 snaps of the game's first drive should follow the scripted opening.
    scripted.forEach((play, idx) => {
      const pick = autoPickPlay({ ...sim, driveNumber: 1, playNumberInDrive: idx });
      expect(pick).toBe(play);
    });

    // On a second drive (driveNumber > 1), the script should NOT re-apply.
    const secondDrivePicks = scripted.map((_, idx) =>
      autoPickPlay({ ...sim, driveNumber: 2, playNumberInDrive: idx, down: 1, distance: 5 }),
    );
    expect(secondDrivePicks).not.toEqual(scripted);
  });
});
