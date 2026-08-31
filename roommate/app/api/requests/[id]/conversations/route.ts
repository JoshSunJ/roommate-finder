import { z } from "zod";

import { startHousingRequestConversation } from "@/features/conversations/service";
import { getCurrentUser, isVerifiedUser } from "@/lib/current-user";

const messageSchema = z.object({
  message: z.string().trim().min(10).max(1_000),
});

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Sign in to share a lead." }, { status: 401 });
  }
  if (!isVerifiedUser(user)) {
    return Response.json(
      { error: "Verify your affiliation before sharing a lead." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const housingRequestId = Number(id);
  const input = messageSchema.safeParse(await request.json().catch(() => null));
  if (!Number.isInteger(housingRequestId) || housingRequestId <= 0 || !input.success) {
    return Response.json(
      { error: "Write a message between 10 and 1,000 characters." },
      { status: 400 },
    );
  }

  const result = await startHousingRequestConversation(
    { housingRequestId, message: input.data.message },
    user.id,
  );
  if (result.kind === "request-not-found") {
    return Response.json({ error: "Active housing request not found." }, { status: 404 });
  }
  if (result.kind === "own-request") {
    return Response.json({ error: "You cannot respond to your own request." }, { status: 403 });
  }
  if (result.kind === "blocked") {
    return Response.json(
      { error: "Contact is unavailable because one of these accounts has blocked the other." },
      { status: 403 },
    );
  }

  return Response.json({ conversationId: result.conversationId }, { status: 201 });
}
