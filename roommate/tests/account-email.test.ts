import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEmailVerificationUrl,
  EmailDeliveryConfigurationError,
  sendEmailVerification,
  validateEmailDeliveryConfiguration,
} from "../features/account-email/delivery";
import {
  createEmailVerificationToken,
  emailVerificationExpiresAt,
  hashEmailVerificationToken,
} from "../features/account-email/tokens";

test("verification tokens are random, hashed, and expire after 24 hours", () => {
  const first = createEmailVerificationToken();
  const second = createEmailVerificationToken();
  const now = new Date("2026-08-25T12:00:00.000Z");

  assert.notEqual(first, second);
  assert.ok(first.length >= 32);
  assert.equal(hashEmailVerificationToken(first).length, 64);
  assert.notEqual(hashEmailVerificationToken(first), first);
  assert.equal(emailVerificationExpiresAt(now).toISOString(), "2026-08-26T12:00:00.000Z");
});

test("verification URLs use the configured trusted application origin", () => {
  assert.equal(
    buildEmailVerificationUrl("safe-token", { AUTH_URL: "https://unitern.example" }),
    "https://unitern.example/api/auth/verify-email?token=safe-token",
  );
});

test("preview delivery is blocked in production", async () => {
  await assert.rejects(
    sendEmailVerification(
      { recipient: "student@example.com", name: "Student", token: "token", idempotencyKey: "one" },
      { NODE_ENV: "production", AUTH_URL: "https://unitern.example", EMAIL_PROVIDER: "preview" },
    ),
    EmailDeliveryConfigurationError,
  );
});

test("production email requires HTTPS and server-only Resend credentials", () => {
  assert.throws(
    () => validateEmailDeliveryConfiguration({
      NODE_ENV: "production",
      AUTH_URL: "http://unitern.example",
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "secret",
      EMAIL_FROM: "Unitern <accounts@unitern.example>",
    }),
    /HTTPS/,
  );
  assert.throws(
    () => validateEmailDeliveryConfiguration({
      NODE_ENV: "production",
      AUTH_URL: "https://unitern.example",
      EMAIL_PROVIDER: "resend",
    }),
    /RESEND_API_KEY/,
  );
});

test("resend delivery keeps credentials server-side and sends an idempotent request", async () => {
  let request: Request | undefined;
  const fetchMock: typeof fetch = async (input, init) => {
    request = new Request(input, init);
    return Response.json({ id: "email-1" });
  };

  const result = await sendEmailVerification(
    { recipient: "student@example.com", name: "Student", token: "secret-token", idempotencyKey: "verification-1" },
    {
      NODE_ENV: "production",
      AUTH_URL: "https://unitern.example",
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "server-secret",
      EMAIL_FROM: "Unitern <accounts@unitern.example>",
    },
    fetchMock,
  );

  assert.equal(result.provider, "resend");
  assert.equal(request?.url, "https://api.resend.com/emails");
  assert.equal(request?.headers.get("authorization"), "Bearer server-secret");
  assert.equal(request?.headers.get("idempotency-key"), "verification-1");
});
