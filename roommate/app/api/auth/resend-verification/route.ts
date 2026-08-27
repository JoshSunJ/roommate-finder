import { z } from "zod";

import prisma from "@/lib/prisma";
import { sendEmailVerification } from "@/features/account-email/delivery";
import {
  canResendEmailVerification,
  issueEmailVerification,
} from "@/features/account-email/service";

const requestSchema = z.object({ email: z.string().trim().email() });
const genericResult = {
  message: "If this account exists and still needs verification, a new link will be sent.",
};

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json(genericResult);

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, email: true, name: true, emailVerifiedAt: true },
  });

  if (!user || user.emailVerifiedAt || !await canResendEmailVerification(user.id)) {
    return Response.json(genericResult);
  }

  const verification = await issueEmailVerification(user.id);
  const delivery = await sendEmailVerification({
    recipient: user.email,
    name: user.name,
    token: verification.token,
    idempotencyKey: `email-verification-${verification.id}`,
  });

  return Response.json({
    ...genericResult,
    ...(delivery.previewUrl ? { verificationPreviewUrl: delivery.previewUrl } : {}),
  });
}
