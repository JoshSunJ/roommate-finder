import { z } from "zod";

import {
  sendPasswordReset,
  validateEmailDeliveryConfiguration,
} from "@/features/account-email/delivery";
import { issuePasswordResetForEmail } from "@/features/password-reset/service";

const requestSchema = z.object({ email: z.string().trim().email() });
const PUBLIC_MESSAGE = "If that account exists, a password-reset link is on its way.";

export async function POST(request: Request) {
  validateEmailDeliveryConfiguration();
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const reset = await issuePasswordResetForEmail(parsed.data.email);
  if (!reset) return Response.json({ message: PUBLIC_MESSAGE });

  try {
    const delivery = await sendPasswordReset({
      recipient: reset.recipient,
      name: reset.name,
      token: reset.token,
      idempotencyKey: `password-reset-${reset.id}`,
    });

    return Response.json({
      message: PUBLIC_MESSAGE,
      ...(delivery.previewUrl ? { passwordResetPreviewUrl: delivery.previewUrl } : {}),
    });
  } catch {
    // Keep provider availability and account existence out of the public response.
    return Response.json({ message: PUBLIC_MESSAGE });
  }
}
