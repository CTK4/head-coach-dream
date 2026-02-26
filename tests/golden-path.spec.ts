import { test, expect } from "@playwright/test";

test("golden path smoke (mobile): new career -> advance week -> reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: /new save/i }).click();
  await page.getByPlaceholder("Coach Name").fill("Golden Smoke");
  await page.locator('[data-test="create-coach-continue"]').click();

  for (let i = 0; i < 5; i += 1) {
    const continueBtn = page.getByRole("button", { name: /continue/i }).first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
    }
  }

  await page.locator('[data-test="accept-offer"]').first().click();
  await page.getByRole("button", { name: /hire/i }).nth(0).click();
  await page.getByRole("button", { name: /hire/i }).nth(1).click();
  await page.getByRole("button", { name: /hire/i }).nth(2).click();

  await page.goto("/hub/regular-season");
  await expect(page.locator('[data-test="advance-week"]')).toBeVisible();
  await page.locator('[data-test="advance-week"]').click();

  const weekLabel = page.getByText(/week\s+\d+/i).first();
  await expect(weekLabel).toBeVisible();

  await page.reload();
  await page.goto("/hub/regular-season");
  await expect(page.locator('[data-test="advance-week"]')).toBeVisible();
});
