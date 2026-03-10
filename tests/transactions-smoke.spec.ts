import { expect, test } from "@playwright/test";

test("transactions screens render and persist", async ({ page }) => {
  await page.goto("/new-save");
  await page.locator('[data-test="start-free-play"]').click();
  await page.locator('[data-test="team-select-MILWAUKEE_NORTHSHORE"]').click();

  await page.goto("/hub/resign-players");
  await expect(page.getByRole("heading", { name: /re-sign players|resign players/i })).toBeVisible();

  await page.goto("/hub/free-agency");
  await expect(page.getByRole("heading", { name: /free agency/i })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: /free agency/i })).toBeVisible();
});
