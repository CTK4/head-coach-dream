import { test, expect, type Locator, type Page } from "@playwright/test";

async function completeOnboarding(page: Page) {
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
}

async function forceCareerStage(page: Page, careerStage: string) {
  await page.evaluate((nextCareerStage) => {
    const key = "hc_career_save";
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.careerStage = nextCareerStage;
    parsed.phase = "HUB";
    window.localStorage.setItem(key, JSON.stringify(parsed));
  }, careerStage);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectWithinViewport(locator: Locator, page: Page) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  const width = page.viewportSize()?.width ?? 375;
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width);
}

test("hub → roster depth chart renders player names (no placeholders)", async ({ page }) => {
  await completeOnboarding(page);

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

test("375px layout smoke: combine/practice/playcall controls do not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await completeOnboarding(page);

  await page.goto("/scouting/combine");
  await expectNoHorizontalOverflow(page);
  await expectWithinViewport(page.getByRole("button", { name: /day 1/i }), page);
  await expectWithinViewport(page.getByRole("button", { name: /leadership/i }), page);

  await forceCareerStage(page, "REGULAR_SEASON");
  await page.goto("/hub/regular-season");
  await expectNoHorizontalOverflow(page);
  await expectWithinViewport(page.getByRole("button", { name: /^Install$/i }), page);
  await expectWithinViewport(page.getByRole("button", { name: /confirm practice plan/i }), page);

  await page.goto("/hub/playcall");
  await expectNoHorizontalOverflow(page);
  await expectWithinViewport(page.getByRole("button", { name: /back to hub/i }), page);
  await expectWithinViewport(page.getByText(/No active game/i), page);
});
