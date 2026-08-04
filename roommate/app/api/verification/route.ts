import { z } from "zod";
import { submitVerification } from "@/features/verification/service";
import { getCurrentUser } from "@/lib/current-user";

const schema = z.object({ affiliationType: z.enum(["student", "intern"]), affiliationName: z.string().trim().min(2).max(120) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to submit verification." }, { status: 401 });
  const input = schema.safeParse(await request.json());
  if (!input.success) return Response.json({ error: "Choose your affiliation type and school or company." }, { status: 400 });
  await submitVerification(user, input.data);
  return Response.json({ ok: true });
}
