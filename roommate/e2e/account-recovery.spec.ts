import { expect, test } from "@playwright/test";

import {
  E2E_EMAIL,
  E2E_INITIAL_PASSWORD,
  E2E_NAME,
  E2E_RESET_PASSWORD,
} from "./test-account";
import { markE2EAccountAffiliationVerified } from "./database";

test("a user can verify an account, sign in, reset the password, and sign in again", async ({ page }) => {
  await page.goto("/sign-up");
  await page.getByLabel("Name").fill(E2E_NAME);
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_INITIAL_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "Account created." })).toBeVisible();
  await page.getByRole("link", { name: "Verify development account ↗" }).click();
  await expect(page.getByRole("heading", { name: "Email verified." })).toBeVisible();
  await page.getByRole("link", { name: "Continue to sign in" }).click();

  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_INITIAL_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(`Signed in as ${E2E_NAME}.`)).toBeVisible();

  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("If that account exists, a password-reset link is on its way.")).toBeVisible();
  await page.getByRole("link", { name: "Open local reset preview ↗" }).click();

  await page.getByLabel("New password").fill(E2E_RESET_PASSWORD);
  await page.getByLabel("Confirm password").fill(E2E_RESET_PASSWORD);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page).toHaveURL(/\/sign-in\?reset=1$/);
  await expect(page.getByText("Password changed. Sign in with your new password.")).toBeVisible();

  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Password").fill(E2E_RESET_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await markE2EAccountAffiliationVerified();

  const listingInput = {
    title: "E2E private room",
    rent: 1450,
    location: "Downtown San Jose, CA",
    description: "A release-confidence listing created by the browser test.",
    bedrooms: 2,
    bathroomType: "Shared",
    availableFrom: "2026-09-01",
    availableUntil: "2026-12-31",
    roomType: "private",
    leaseType: "fixed_term",
    furnished: true,
    utilitiesIncluded: false,
    utilitiesEstimate: 90,
    securityDeposit: 500,
    parkingAvailable: false,
    petsAllowed: false,
    coordinates: { latitude: 37.3352, longitude: -121.8811 },
  };
  const createResponse = await page.request.post("/api/listings", { data: listingInput });
  expect(createResponse.status()).toBe(201);
  const listing = await createResponse.json();

  const updateResponse = await page.request.patch(`/api/listings/${listing.id}`, {
    data: {
      action: "details",
      listing: { ...listingInput, rent: 1500, title: "Updated E2E private room" },
    },
  });
  expect(updateResponse.status()).toBe(200);
  expect((await updateResponse.json()).rent).toBe(1500);

  const deleteResponse = await page.request.delete(`/api/listings/${listing.id}`);
  expect(deleteResponse.status()).toBe(204);
  expect((await page.request.get(`/api/listings/${listing.id}`)).status()).toBe(404);
});

test("anonymous dashboard access is redirected to sign in", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in/);
});
