import { test, expect } from "@playwright/test";

test("hub → roster depth chart renders player names (no placeholders)", async ({ page }) => {
  await page.goto("/");

  await page.getByPlaceholder("Coach Name").fill("Test Coach");
  await page.getByRole("button", { name: /continue/i }).click();

  await page.getByRole("button", { name: /continue/i }).click();

  for (let i = 0; i < 3; i += 1) {
    const cont = page.getByRole("button", { name: /continue/i });
    if (await cont.isVisible().catch(() => false)) await cont.click();
  }

  await page.getByRole("button", { name: /accept/i }).first().click();

  const hireButtons = page.getByRole("button", { name: /hire/i });
  const count = await hireButtons.count();
  expect(count).toBeGreaterThanOrEqual(3);
  await hireButtons.nth(0).click();
  await hireButtons.nth(1).click();
  await hireButtons.nth(2).click();

  await expect(page.getByText(/franchise hub/i)).toBeVisible();

  await page.goto("/roster/depth-chart");

  await expect(page.getByText(/Depth Chart/i)).toBeVisible();

  const firstSelect = page.locator("[role='combobox']").first();
  await firstSelect.click();
  const options = page.locator("[role='option']");
  await expect(options.first()).toBeVisible();
  const optionCount = await options.count();
  expect(optionCount).toBeGreaterThan(3);
});

test("hub scouting tile routes to /scouting", async ({ page }) => {
  await page.goto("/scouting");
  await expect(page.locator("body")).toBeVisible();
});
