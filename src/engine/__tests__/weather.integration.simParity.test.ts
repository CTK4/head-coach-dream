import { describe, expect, it } from "vitest";
import { initGameSim, stepPlay } from "@/engine/gameSim";
import type { GameWeather } from "@/engine/weather/generateGameWeather";

const lowWind: GameWeather = {
  version: 1,
  gameKey: "k1",
  venueTeamId: "HOME",
  isDome: false,
  monthIndex: 9,
  temperatureF: 50,
  windMph: 5,
  condition: "CLEAR",
  precipTier: "NONE",
  windTier: "LOW",
  surface: "DRY",
};

const highWind: GameWeather = {
  ...lowWind,
  gameKey: "k2",
  windMph: 22,
  windTier: "HIGH",
};

describe("weather integration in sim", () => {
  it("is deterministic with same weather context", () => {
    const simA = initGameSim({ homeTeamId: "HOME", awayTeamId: "AWAY", seed: 77, weather: highWind });
    const simB = initGameSim({ homeTeamId: "HOME", awayTeamId: "AWAY", seed: 77, weather: highWind });
    const outA = stepPlay({ ...simA, ballOn: 45, down: 4, distance: 8 }, "FG");
    const outB = stepPlay({ ...simB, ballOn: 45, down: 4, distance: 8 }, "FG");
    expect(outA.sim.lastResult).toEqual(outB.sim.lastResult);
  });

  it("consumes weather modifiers in special-teams resolution", () => {
    let calmMakes = 0;
    let windyMakes = 0;
    for (let seed = 700; seed < 1000; seed += 1) {
      const calm = stepPlay({ ...initGameSim({ homeTeamId: "HOME", awayTeamId: "AWAY", seed, weather: lowWind }), ballOn: 55, down: 4, distance: 7 }, "FG");
      const windy = stepPlay({ ...initGameSim({ homeTeamId: "HOME", awayTeamId: "AWAY", seed, weather: highWind }), ballOn: 55, down: 4, distance: 7 }, "FG");
      if (String(calm.sim.lastResult).includes("GOOD")) calmMakes += 1;
      if (String(windy.sim.lastResult).includes("GOOD")) windyMakes += 1;
    }
    expect(windyMakes).toBeLessThan(calmMakes);
  });
});
