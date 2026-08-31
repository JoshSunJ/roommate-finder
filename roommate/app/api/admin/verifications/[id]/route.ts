import { verificationReviewSchema } from "@/features/verification/schema";
import { reviewVerification } from "@/features/verification/service";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

type Props = { params: Promise<{ id: string }> };
export async function PATCH(request: Request, { params }: Props) {
  const reviewer = await getCurrentUser();
  if (!isAdmin(reviewer) || !reviewer) return Response.json({ error: "Administrator access required." }, { status: 403 });
  const { id } = await params;
  const input = verificationReviewSchema.safeParse(await request.json().catch(() => null));
  if (!Number.isInteger(Number(id)) || !input.success) return Response.json({ error: "Invalid review." }, { status: 400 });
  if (await reviewVerification(
    Number(id),
    reviewer.id,
    input.data.status,
    input.data.reviewerNote,
  ) === "not-found") return Response.json({ error: "Submission not found." }, { status: 404 });
  return Response.json({ ok: true });
}
