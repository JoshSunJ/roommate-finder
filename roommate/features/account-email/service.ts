import prisma from "@/lib/prisma";
import {
  createEmailVerificationToken,
  emailVerificationExpiresAt,
  hashEmailVerificationToken,
} from "@/features/account-email/tokens";

const RESEND_COOLDOWN_MS = 60 * 1000;

export type IssuedEmailVerification = {
  id: string;
  token: string;
  expiresAt: Date;
};

export async function issueEmailVerification(
  userId: number,
  now = new Date(),
): Promise<IssuedEmailVerification> {
  const token = createEmailVerificationToken();
  const tokenHash = hashEmailVerificationToken(token);
  const expiresAt = emailVerificationExpiresAt(now);

  const record = await prisma.$transaction(async (transaction) => {
    await transaction.emailVerificationToken.deleteMany({ where: { userId } });
    return transaction.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  });

  return { id: record.id, token, expiresAt };
}

export async function canResendEmailVerification(userId: number, now = new Date()) {
  const latest = await prisma.emailVerificationToken.findFirst({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return !latest || now.getTime() - latest.createdAt.getTime() >= RESEND_COOLDOWN_MS;
}

export async function consumeEmailVerification(token: string, now = new Date()) {
  if (token.length < 32 || token.length > 256) return false;
  const tokenHash = hashEmailVerificationToken(token);

  return prisma.$transaction(async (transaction) => {
    const record = await transaction.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!record || record.expiresAt <= now) {
      if (record) {
        await transaction.emailVerificationToken.delete({ where: { id: record.id } });
      }
      return false;
    }

    const consumed = await transaction.emailVerificationToken.deleteMany({
      where: { id: record.id, tokenHash },
    });
    if (consumed.count !== 1) return false;

    await transaction.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: now },
    });
    await transaction.emailVerificationToken.deleteMany({
      where: { userId: record.userId },
    });
    return true;
  });
}
