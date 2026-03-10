import { test, expect } from "@playwright/test";

test("combine run creates results and interview pool", async ({ page }) => {
  await page.goto("/new-save");
  await page.locator('[data-test="start-free-play"]').click();
  await page.locator('[data-test="team-select-MILWAUKEE_NORTHSHORE"]').click();

  await page.goto("/hub/combine");
  await page.getByRole("button", { name: /run combine/i }).click();
  await page.getByRole("button", { name: /build interview pool/i }).click();

  await expect(page.getByText(/athleticism grade/i).first()).toBeVisible();
  await expect(page.getByText(/combine interview pool/i)).toBeVisible();
});
