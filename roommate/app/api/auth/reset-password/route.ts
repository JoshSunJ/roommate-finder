import { z } from "zod";

import { resetPasswordWithToken } from "@/features/password-reset/service";

const resetSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = resetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Use a valid reset link and a password of at least 8 characters." },
      { status: 400 },
    );
  }

  const reset = await resetPasswordWithToken(parsed.data.token, parsed.data.password);
  if (!reset) {
    return Response.json(
      { error: "That reset link is invalid, expired, or already used." },
      { status: 400 },
    );
  }

  return Response.json({ message: "Your password has been changed." });
}
