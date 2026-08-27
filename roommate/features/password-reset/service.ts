import { hash } from "bcryptjs";

import prisma from "@/lib/prisma";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
  passwordResetExpiresAt,
} from "@/features/password-reset/tokens";

const REQUEST_COOLDOWN_MS = 60 * 1000;

export type IssuedPasswordReset = {
  id: string;
  recipient: string;
  name: string;
  token: string;
};

export async function issuePasswordResetForEmail(
  email: string,
  now = new Date(),
): Promise<IssuedPasswordReset | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      emailVerifiedAt: true,
      passwordResetToken: { select: { createdAt: true } },
    },
  });

  // Returning null for every ineligible case lets the API give the same public
  // response whether an account exists or not.
  if (!user?.passwordHash || !user.emailVerifiedAt) return null;
  if (
    user.passwordResetToken
    && now.getTime() - user.passwordResetToken.createdAt.getTime() < REQUEST_COOLDOWN_MS
  ) {
    return null;
  }

  const token = createPasswordResetToken();
  const record = await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tokenHash: hashPasswordResetToken(token),
      expiresAt: passwordResetExpiresAt(now),
    },
    update: {
      tokenHash: hashPasswordResetToken(token),
      expiresAt: passwordResetExpiresAt(now),
      createdAt: now,
    },
  });

  return {
    id: record.id,
    recipient: user.email,
    name: user.name,
    token,
  };
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
  now = new Date(),
) {
  if (token.length < 32 || token.length > 256) return false;

  const tokenHash = hashPasswordResetToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true },
  });

  if (!record || record.expiresAt <= now) {
    if (record) {
      await prisma.passwordResetToken.deleteMany({ where: { id: record.id } });
    }
    return false;
  }

  // Hash before opening the transaction so an intentionally expensive bcrypt
  // operation does not hold a database connection or row lock.
  const passwordHash = await hash(password, 12);

  return prisma.$transaction(async (transaction) => {
    const consumed = await transaction.passwordResetToken.deleteMany({
      where: { id: record.id, tokenHash, expiresAt: { gt: now } },
    });
    if (consumed.count !== 1) return false;

    await transaction.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        sessionVersion: { increment: 1 },
      },
    });
    return true;
  });
}
