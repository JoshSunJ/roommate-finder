import { z } from "zod";
import { reviewVerification } from "@/features/verification/service";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

type Props = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["verified", "rejected"]) });
export async function PATCH(request: Request, { params }: Props) {
  if (!isAdmin(await getCurrentUser())) return Response.json({ error: "Administrator access required." }, { status: 403 });
  const { id } = await params; const input = schema.safeParse(await request.json());
  if (!Number.isInteger(Number(id)) || !input.success) return Response.json({ error: "Invalid review." }, { status: 400 });
  if (!await reviewVerification(Number(id), input.data.status)) return Response.json({ error: "Submission not found." }, { status: 404 });
  return Response.json({ ok: true });
}
