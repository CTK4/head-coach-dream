import { describe, expect, it } from "vitest";
import { createInitialStateForTests, gameReducerMonolith } from "@/context/GameContext";
import { buildWeatherGameKey } from "@/engine/weather/generateGameWeather";

describe("weather persistence", () => {
  it("persists weather immutably per gameKey", () => {
    const base = createInitialStateForTests();
    const teamId = String(base.acceptedOffer?.teamId ?? "");
    const opp = "BOSTON_HARBORMEN";
    const weekType = "REGULAR_SEASON" as const;
    const weekNumber = 3;
    const gameKey = buildWeatherGameKey({ season: base.season, weekType, weekNumber, homeTeamId: teamId, awayTeamId: opp });

    const once = gameReducerMonolith(base, { type: "ENSURE_GAME_WEATHER", payload: { weekType, weekNumber, homeTeamId: teamId, awayTeamId: opp } });
    const twice = gameReducerMonolith(once, { type: "ENSURE_GAME_WEATHER", payload: { weekType, weekNumber, homeTeamId: teamId, awayTeamId: opp } });

    expect(once.weatherByGameKey[gameKey]).toBeDefined();
    expect(twice.weatherByGameKey[gameKey]).toEqual(once.weatherByGameKey[gameKey]);
  });
});
