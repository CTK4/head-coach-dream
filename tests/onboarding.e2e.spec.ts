import { test, expect } from "@playwright/test";

test("onboarding: new career -> advance week -> reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: /new save/i }).click();
  await page.getByPlaceholder("Coach Name").fill("Golden Smoke");

  await page.locator('[data-test="hometown-select"]').click();
  await page.locator('[data-test^="hometown-option-"]').first().click();
  await page.locator('[data-test="create-coach-continue"]').click();

  await page.locator('[data-test="background-continue"]').first().click();

  for (let interviewIndex = 0; interviewIndex < 3; interviewIndex += 1) {
    await page.locator('[data-test^="interview-team-"]').nth(interviewIndex).click();
    for (let answerIndex = 0; answerIndex < 5; answerIndex += 1) {
      await page.locator('[data-test="interview-answer-0"]').click();
    }
  }

  await page.locator('[data-test="accept-offer"]').first().click();
  await page.locator('[data-test="hire-oc"]').click();
  await page.locator('[data-test="hire-dc"]').click();
  await page.locator('[data-test="hire-stc"]').click();

  await page.goto("/hub/regular-season");
  await expect(page.locator('[data-test="advance-week"]')).toBeVisible();
  await page.locator('[data-test="advance-week"]').click();

  await expect(page.locator('[data-test="week-label"]')).toBeVisible();

  await page.reload();
  await page.goto("/hub/regular-season");
  await expect(page.locator('[data-test="advance-week"]')).toBeVisible();
});
