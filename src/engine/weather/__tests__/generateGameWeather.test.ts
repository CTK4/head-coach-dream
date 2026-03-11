import { describe, expect, it } from "vitest";
import { generateGameWeather } from "@/engine/weather/generateGameWeather";

describe("generateGameWeather", () => {
  it("is deterministic for identical context", () => {
    const a = generateGameWeather({
      saveSeed: 12345,
      season: 2026,
      weekType: "REGULAR_SEASON",
      weekNumber: 8,
      homeTeamId: "SEATTLE_EVERGREENS",
      awayTeamId: "DALLAS_IMPERIALS",
    });
    const b = generateGameWeather({
      saveSeed: 12345,
      season: 2026,
      weekType: "REGULAR_SEASON",
      weekNumber: 8,
      homeTeamId: "SEATTLE_EVERGREENS",
      awayTeamId: "DALLAS_IMPERIALS",
    });
    expect(a).toEqual(b);
  });

  it("never generates precipitation for dome teams", () => {
    const weather = generateGameWeather({
      saveSeed: 91,
      season: 2026,
      weekType: "REGULAR_SEASON",
      weekNumber: 12,
      homeTeamId: "ATLANTA_APEX",
      awayTeamId: "BOSTON_HARBORMEN",
    });
    expect(weather.isDome).toBe(true);
    expect(weather.condition).toBe("CLEAR");
    expect(weather.precipTier).toBe("NONE");
    expect(weather.windMph).toBe(0);
  });
});
