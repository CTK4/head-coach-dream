import { test, expect } from "@playwright/test";

test("golden path smoke (mobile): free play -> advance week -> reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  // Always accept confirm dialogs (FreePlaySetup uses window.confirm)
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.goto("/");

  // 1) Go directly to save mode selector
  await page.goto("/new-save");

  // 2) Start Free Play
  await page.locator('[data-test="start-free-play"]').click();

  // 3) Select a team
  await page.locator('[data-test="team-select-MILWAUKEE_NORTHSHORE"]').click();

  // 4) Confirm we landed in hub
  await expect(page.locator('[data-test="hub-root"]')).toBeVisible();

  // 5) Go to Regular Season (direct route fallback)
  await page.goto("/hub/regular-season");

  // 6) Advance week
  await expect(page.locator('[data-test="advance-week"]')).toBeVisible();
  await page.locator('[data-test="advance-week"]').click();

  // 7) Verify week label exists
  await expect(page.locator('[data-test="week-label"]')).toBeVisible();

  // 8) Reload and verify state still usable
  await page.reload();
  await page.goto("/hub/regular-season");
  await expect(page.locator('[data-test="advance-week"]')).toBeVisible();
});
