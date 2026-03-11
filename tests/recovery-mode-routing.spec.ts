import { expect, test } from "@playwright/test";
import { seedActiveSaveViaManagerKeys } from "./helpers/saveSlot";

test("shows recovery mode screen when recoveryNeeded is set", async ({ page }) => {
  await seedActiveSaveViaManagerKeys(page, {
    phase: "HUB",
    recoveryNeeded: true,
    recoveryErrors: ["Simulated integrity error"],
  });

  await page.goto("/hub");

  await expect(page.getByRole("heading", { name: /Recovery Mode Required/i })).toBeVisible();
  await expect(page.getByText(/Simulated integrity error/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Restore Backup/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Rebuild Indices/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Start Fresh Save/i })).toBeVisible();
  await expect(page.getByText(/Franchise Hub/i)).toHaveCount(0);
});
