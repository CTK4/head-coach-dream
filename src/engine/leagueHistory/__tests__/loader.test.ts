import { describe, expect, it } from "vitest";
import { getHallOfFame, getMvpBySeason, getSeasons } from "@/engine/leagueHistory/loader";

describe("league history loader", () => {
  it("loads seasons and required champion fields", () => {
    const seasons = getSeasons();

    expect(seasons.length).toBeGreaterThan(0);
    for (const season of seasons) {
      expect(typeof season.season).toBe("number");
      expect(season.champion.length).toBeGreaterThan(0);
      expect(season.runnerUp.length).toBeGreaterThan(0);
    }
  });

  it("loads hall of fame rows with typed fields", () => {
    const hall = getHallOfFame();

    expect(hall.length).toBeGreaterThan(0);
    for (const inductee of hall) {
      expect(inductee.player.length).toBeGreaterThan(0);
      expect(inductee.team.length).toBeGreaterThan(0);
      expect(inductee.position.length).toBeGreaterThan(0);
      expect(typeof inductee.classYear).toBe("number");
    }
  });

  it("returns null MVP entries safely for missing seasons", () => {
    const missing = getMvpBySeason(9999);

    expect(missing.ironCrownMvp).toBeNull();
    expect(missing.regularSeasonMvp).toBeNull();
  });
});
