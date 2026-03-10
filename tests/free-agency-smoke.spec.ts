import { test, expect } from "@playwright/test";

test("free agency screen resolves without hanging", async ({ page }) => {
  await page.goto("/new-save");
  await page.locator('[data-test="start-free-play"]').click();
  await page.locator('[data-test="team-select-MILWAUKEE_NORTHSHORE"]').click();

  await page.goto("/hub/free-agency");
  await page.getByRole("button", { name: /initialize market/i }).click();
  await page.getByRole("button", { name: /resolve week/i }).click();

  await expect(page.getByRole("heading", { name: /free agency/i })).toBeVisible();
  await expect(page.getByText(/free agency/i).first()).toBeVisible();
});
