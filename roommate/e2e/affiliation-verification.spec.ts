import { expect, test } from "@playwright/test";

import {
  E2E_AFFILIATION_EMAIL,
  E2E_AFFILIATION_INSTITUTION_EMAIL,
  E2E_AFFILIATION_PASSWORD,
} from "./test-account";

test("a student verifies a trusted university affiliation through email", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_AFFILIATION_EMAIL);
  await page.getByLabel("Password").fill(E2E_AFFILIATION_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/verify");
  await page.getByRole("combobox", { name: "University" }).selectOption({
    label: "San José State University",
  });
  await page.getByLabel("School or company email").fill(E2E_AFFILIATION_INSTITUTION_EMAIL);
  await page.getByRole("button", { name: "Verify affiliation" }).click();

  await expect(page.getByRole("heading", { name: "Check your affiliation email." })).toBeVisible();
  await page.getByRole("link", { name: "verify affiliation ↗" }).click();

  await expect(page).toHaveURL(/\/verify\?status=verified$/);
  await expect(page.getByText("Affiliation email confirmed.")).toBeVisible();
  await expect(page.getByText("Verified student")).toBeVisible();
  await expect(page.getByText("Method: institution email", { exact: false })).toBeVisible();
});
