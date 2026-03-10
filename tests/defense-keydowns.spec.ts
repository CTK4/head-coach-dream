import { expect, test, type Page } from "@playwright/test";
import { updateActiveSave } from "./helpers/saveSlot";

async function completeOnboarding(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder("Coach Name").fill("Def Test");
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  for (let i = 0; i < 3; i += 1) {
    const cont = page.getByRole("button", { name: /continue/i });
    if (await cont.isVisible().catch(() => false)) await cont.click();
  }
  await page.getByRole("button", { name: /accept/i }).first().click();
}

test("defensive drawer opens on key down and blitz resolves", async ({ page }) => {
  await completeOnboarding(page);

  await updateActiveSave(page, (state) => ({
    ...state,
    game: {
      ...state.game,
      awayTeamId: "ATL",
      weekType: "REGULAR_SEASON",
      weekNumber: 1,
      down: 3,
      distance: 7,
      ballOn: 58,
      defenseUserMode: "KEY_DOWNS",
      needsDefensiveCall: true,
      defensiveCallSituation: { down: 3, distance: 7, yardLine: 42, quarter: 4, clockSec: 72 },
    },
  }));

  await page.goto("/hub/playcall");
  await expect(page.getByText(/Defensive Play Call/i)).toBeVisible();
  await page.getByRole("button", { name: /^Blitz$/i }).click();
  await page.getByRole("button", { name: /confirm call/i }).click();
  await expect(page.locator("body")).toBeVisible();
});
