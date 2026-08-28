import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPasswordResetUrl,
  sendPasswordReset,
} from "../features/account-email/delivery";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  passwordResetExpiresAt,
} from "../features/password-reset/tokens";

test("password-reset tokens are random, stored as hashes, and expire after one hour", () => {
  const first = createPasswordResetToken();
  const second = createPasswordResetToken();
  const now = new Date("2026-08-27T12:00:00.000Z");

  assert.notEqual(first, second);
  assert.ok(first.length >= 32);
  assert.equal(hashPasswordResetToken(first).length, 64);
  assert.notEqual(hashPasswordResetToken(first), first);
  assert.equal(passwordResetExpiresAt(now).toISOString(), "2026-08-27T13:00:00.000Z");
});

test("password-reset URLs use the configured trusted origin", () => {
  assert.equal(
    buildPasswordResetUrl("safe-token", { AUTH_URL: "https://unitern.example" }),
    "https://unitern.example/reset-password?token=safe-token",
  );
});

test("local preview mode returns a reset link without calling an email provider", async () => {
  const delivery = await sendPasswordReset(
    { recipient: "student@example.com", name: "Student", token: "local-token", idempotencyKey: "reset-1" },
    { AUTH_URL: "http://localhost:3000", EMAIL_PROVIDER: "preview" },
  );

  assert.equal(delivery.provider, "preview");
  assert.equal(delivery.previewUrl, "http://localhost:3000/reset-password?token=local-token");
});

test("production password-reset email is server-authenticated and idempotent", async () => {
  let request: Request | undefined;
  const fetchMock: typeof fetch = async (input, init) => {
    request = new Request(input, init);
    return Response.json({ id: "email-2" });
  };

  const result = await sendPasswordReset(
    { recipient: "student@example.com", name: "Student", token: "secret-token", idempotencyKey: "reset-2" },
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
  assert.equal(result.providerMessageId, "email-2");
  assert.equal(request?.url, "https://api.resend.com/emails");
  assert.equal(request?.headers.get("authorization"), "Bearer server-secret");
  assert.equal(request?.headers.get("idempotency-key"), "reset-2");
  assert.match(await request!.text(), /Reset your Unitern password/);
});
