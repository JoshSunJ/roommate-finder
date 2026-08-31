import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAffiliationVerificationUrl,
  sendAffiliationVerification,
} from "../features/account-email/delivery";
import {
  normalizeEmailDomain,
  maskEmail,
} from "../features/verification/format";
import {
  affiliationTokenExpiresAt,
  createAffiliationVerificationToken,
  hashAffiliationVerificationToken,
} from "../features/verification/tokens";

test("affiliation tokens are random, hashed, and expire after 24 hours", () => {
  const first = createAffiliationVerificationToken();
  const second = createAffiliationVerificationToken();
  const now = new Date("2026-08-30T12:00:00.000Z");

  assert.notEqual(first, second);
  assert.ok(first.length >= 32);
  assert.equal(hashAffiliationVerificationToken(first).length, 64);
  assert.notEqual(hashAffiliationVerificationToken(first), first);
  assert.equal(
    affiliationTokenExpiresAt(now).toISOString(),
    "2026-08-31T12:00:00.000Z",
  );
});

test("email domains are normalized and affiliation addresses are masked", () => {
  assert.equal(normalizeEmailDomain(" Student@SJSU.EDU "), "sjsu.edu");
  assert.equal(maskEmail("student@sjsu.edu"), "st•••••@sjsu.edu");
});

test("affiliation verification links use the configured application origin", () => {
  assert.equal(
    buildAffiliationVerificationUrl("safe-token", { AUTH_URL: "https://unitern.example" }),
    "https://unitern.example/api/verification/confirm?token=safe-token",
  );
});

test("preview delivery exposes a local confirmation link without sending email", async () => {
  const result = await sendAffiliationVerification(
    {
      recipient: "student@sjsu.edu",
      name: "Student",
      organizationName: "San Jose State University",
      token: "preview-token",
      idempotencyKey: "affiliation-1",
    },
    {
      NODE_ENV: "development",
      AUTH_URL: "http://localhost:3000",
      EMAIL_PROVIDER: "preview",
    },
  );

  assert.deepEqual(result, {
    provider: "preview",
    previewUrl: "http://localhost:3000/api/verification/confirm?token=preview-token",
  });
});
