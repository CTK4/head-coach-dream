import { test, expect } from "@playwright/test";

test("playoffs page renders bracket and playable CTA", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/new-save");
  await page.locator('[data-test="start-free-play"]').click();
  await page.locator('[data-test="team-select-MILWAUKEE_NORTHSHORE"]').click();

  await page.evaluate(() => {
    const raw = localStorage.getItem("hc_career_save");
    if (!raw) return;
    const s = JSON.parse(raw);
    s.phase = "HUB";
    s.careerStage = "PLAYOFFS";
    s.playoffs = {
      season: s.season,
      round: "DIVISIONAL",
      bracket: {
        conferences: {
          EAST: {
            conferenceId: "EAST",
            seeds: ["MILWAUKEE_NORTHSHORE", "ATLANTA_APEX", "BIRMINGHAM_VULCANS", "CLEVELAND_BULLDOGS"],
            gamesByRound: {
              DIVISIONAL: [{
                gameId: "DIVISIONAL:EAST:1:MILWAUKEE_NORTHSHORE:CLEVELAND_BULLDOGS",
                round: "DIVISIONAL",
                homeTeamId: "MILWAUKEE_NORTHSHORE",
                awayTeamId: "CLEVELAND_BULLDOGS",
                conferenceId: "EAST",
              }],
            },
          },
        },
      },
      pendingUserGame: {
        round: "DIVISIONAL",
        gameId: "DIVISIONAL:EAST:1:MILWAUKEE_NORTHSHORE:CLEVELAND_BULLDOGS",
        homeTeamId: "MILWAUKEE_NORTHSHORE",
        awayTeamId: "CLEVELAND_BULLDOGS",
      },
      completedGames: {},
    };
    localStorage.setItem("hc_career_save", JSON.stringify(s));
  });

  await page.reload();
  await page.goto("/hub/playoffs");
  await expect(page.getByText("Playoffs")).toBeVisible();
  const cta = page.getByRole("button", { name: "Play Next Game" });
  await expect(cta).toBeVisible();
});
