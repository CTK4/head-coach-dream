import { test, expect } from "@playwright/test";

test("story onboarding flows through MIL -> ATL -> OMA to hub (mobile)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: /new save/i }).click();
  await page.getByPlaceholder("Coach Name").fill("Story Flow");
  await page.locator('[data-test="hometown-select"]').click();
  await page.locator('[data-test^="hometown-option-"]').first().click();
  await page.locator('[data-test="create-coach-continue"]').click();
  await page.locator('[data-test="background-continue"]').first().click();

  const sequence = ["MILWAUKEE", "ATLANTA", "OMAHA"];
  for (const city of sequence) {
    const candidate = page.locator(`[data-test*="interview-team-"][data-test*="${city}"]`).first();
    if (await candidate.count()) {
      await candidate.click();
    } else {
      await page.locator('[data-test^="interview-team-"]').first().click();
    }
    for (let i = 0; i < 5; i += 1) {
      await page.locator('[data-test="interview-answer-0"]').click();
    }
  }

  await page.locator('[data-test="accept-offer"]').first().click();
  await page.locator('[data-test="hire-oc"]').click();
  await page.locator('[data-test="hire-dc"]').click();
  await page.locator('[data-test="hire-stc"]').click();

  await expect(page.locator('[data-test="hub-root"]')).toBeVisible();
});
