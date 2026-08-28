import "dotenv/config";

import assert from "node:assert/strict";
import { after, test } from "node:test";
import { compare, hash } from "bcryptjs";

import { consumeEmailVerification, issueEmailVerification } from "../../features/account-email/service";
import { issuePasswordResetForEmail, resetPasswordWithToken } from "../../features/password-reset/service";
import { enforceRateLimit, rateLimitKey } from "../../features/security/rate-limit";
import prisma from "../../lib/prisma";

const runId = `${process.pid}-${Date.now()}`;
const verificationEmail = `verification-${runId}@integration.unitern.local`;
const resetEmail = `reset-${runId}@integration.unitern.local`;
const rateIdentifier = `rate-${runId}`;

after(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [verificationEmail, resetEmail] } },
  });
  await prisma.rateLimitBucket.deleteMany({
    where: { key: rateLimitKey("integration", rateIdentifier) },
  });
  await prisma.$disconnect();
});

test("email verification is persisted, single-use, and marks the user verified", async () => {
  const user = await prisma.user.create({
    data: { name: "Verification Integration", email: verificationEmail },
  });
  const verification = await issueEmailVerification(user.id);
  const stored = await prisma.emailVerificationToken.findFirstOrThrow({
    where: { userId: user.id },
  });

  assert.notEqual(stored.tokenHash, verification.token);
  assert.equal(await consumeEmailVerification(verification.token), true);
  assert.equal(await consumeEmailVerification(verification.token), false);
  assert.ok((await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).emailVerifiedAt);
});

test("password reset changes the hash, revokes sessions, and rejects replay", async () => {
  const oldHash = await hash("OldPassword-2026!", 4);
  const user = await prisma.user.create({
    data: {
      name: "Reset Integration",
      email: resetEmail,
      emailVerifiedAt: new Date(),
      passwordHash: oldHash,
    },
  });
  const reset = await issuePasswordResetForEmail(resetEmail);
  assert.ok(reset);

  assert.equal(await resetPasswordWithToken(reset.token, "NewPassword-2026!"), true);
  assert.equal(await resetPasswordWithToken(reset.token, "ReplayPassword-2026!"), false);

  const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  assert.equal(await compare("NewPassword-2026!", updated.passwordHash!), true);
  assert.equal(updated.sessionVersion, 1);
  assert.equal(await prisma.passwordResetToken.findUnique({ where: { userId: user.id } }), null);
});

test("the shared database counter blocks a fixed window and resets afterward", async () => {
  const policy = { scope: "integration", limit: 2, windowMs: 60_000 };
  const now = new Date("2026-08-27T20:00:00.000Z");

  assert.equal((await enforceRateLimit(policy, rateIdentifier, now)).allowed, true);
  assert.equal((await enforceRateLimit(policy, rateIdentifier, now)).allowed, true);
  assert.equal((await enforceRateLimit(policy, rateIdentifier, now)).allowed, false);
  assert.equal((await enforceRateLimit(
    policy,
    rateIdentifier,
    new Date(now.getTime() + 60_001),
  )).allowed, true);
});
