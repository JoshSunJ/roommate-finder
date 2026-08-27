import { hash } from "bcryptjs";
import { z } from "zod";

import prisma from "@/lib/prisma";
import {
  sendEmailVerification,
  validateEmailDeliveryConfiguration,
} from "@/features/account-email/delivery";
import { issueEmailVerification } from "@/features/account-email/service";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  validateEmailDeliveryConfiguration();
  const parsed = registrationSchema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      { error: "Use a name, a valid email, and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return Response.json(
      { error: "An account already exists for that email." },
      { status: 409 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { name: parsed.data.name, email, passwordHash },
  });

  const verification = await issueEmailVerification(user.id);
  let delivery;
  try {
    delivery = await sendEmailVerification({
      recipient: user.email,
      name: user.name,
      token: verification.token,
      idempotencyKey: `email-verification-${verification.id}`,
    });
  } catch {
    return Response.json({
      id: user.id,
      requiresEmailVerification: true,
      emailDeliveryUnavailable: true,
    }, { status: 202 });
  }

  return Response.json(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      requiresEmailVerification: true,
      emailDeliveryUnavailable: false,
      ...(delivery.previewUrl ? { verificationPreviewUrl: delivery.previewUrl } : {}),
    },
    { status: 201 },
  );
}
