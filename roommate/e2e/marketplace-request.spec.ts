import { expect, test } from "@playwright/test";

import {
  E2E_MARKETPLACE_HELPER_EMAIL,
  E2E_MARKETPLACE_OWNER_EMAIL,
  E2E_MARKETPLACE_PASSWORD,
} from "./test-account";

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(E2E_MARKETPLACE_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("a requester can edit a request and receive a lead in a private conversation", async ({ browser }) => {
  const ownerContext = await browser.newContext();
  const ownerPage = await ownerContext.newPage();
  await signIn(ownerPage, E2E_MARKETPLACE_OWNER_EMAIL);

  await ownerPage.goto("/requests/new");
  await ownerPage.getByLabel("Request title").fill("Need a room for a Chicago internship");
  await ownerPage.getByLabel("Maximum monthly rent").fill("1500");
  await ownerPage.getByLabel("Preferred area").fill("Chicago, IL");
  await ownerPage.getByLabel("Bedrooms needed").fill("1");
  await ownerPage.getByLabel("Move-in date").fill("2026-06-01");
  await ownerPage.getByLabel("Move-out date").fill("2026-08-31");
  await ownerPage.getByLabel("Introduce your housing need").fill(
    "Looking for a furnished room near public transportation for a summer internship.",
  );
  await ownerPage.getByRole("button", { name: "Post housing request" }).click();
  await expect(ownerPage).toHaveURL(/\/requests\/\d+$/);
  const requestUrl = ownerPage.url();

  await ownerPage.getByRole("link", { name: "Edit request ↗" }).click();
  await ownerPage.getByLabel("Maximum monthly rent").fill("1650");
  await ownerPage.getByRole("button", { name: "Save changes" }).click();
  await expect(ownerPage.getByText("Up to $1650/month")).toBeVisible();

  const helperContext = await browser.newContext();
  const helperPage = await helperContext.newPage();
  await signIn(helperPage, E2E_MARKETPLACE_HELPER_EMAIL);
  await helperPage.goto(requestUrl);
  await helperPage.getByLabel("Message").fill(
    "I know of a furnished room near the train that may fit your dates.",
  );
  await helperPage.getByRole("button", { name: "Share lead privately" }).click();
  await expect(helperPage).toHaveURL(/\/inquiries\/\d+$/);
  await expect(helperPage.getByText("I know of a furnished room near the train")).toBeVisible();

  await ownerPage.goto("/inquiries");
  await ownerPage.getByRole("link", { name: /Helpful Student/ }).click();
  await expect(ownerPage.getByRole("heading", { name: "Need a room for a Chicago internship" })).toBeVisible();
  await expect(ownerPage.getByText("I know of a furnished room near the train")).toBeVisible();

  await ownerPage.goto(requestUrl);
  ownerPage.once("dialog", (dialog) => dialog.accept());
  await ownerPage.getByRole("button", { name: "Delete request" }).click();
  await expect(ownerPage).toHaveURL(/\/dashboard$/);

  await helperContext.close();
  await ownerContext.close();
});
