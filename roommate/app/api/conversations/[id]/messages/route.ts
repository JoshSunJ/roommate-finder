import { z } from "zod";

import { sendConversationMessage } from "@/features/conversations/service";
import { getCurrentUser, isVerifiedUser } from "@/lib/current-user";

const messageSchema = z.object({
  body: z.string().trim().min(1).max(1_000),
});

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: "Sign in to reply." }, { status: 401 });
  if (!isVerifiedUser(currentUser)) {
    return Response.json({ error: "Verify your affiliation before sending messages." }, { status: 403 });
  }

  const { id } = await params;
  const conversationId = Number(id);
  const parsed = messageSchema.safeParse(await request.json().catch(() => null));
  if (!Number.isInteger(conversationId) || conversationId <= 0 || !parsed.success) {
    return Response.json({ error: "Write a message between 1 and 1,000 characters." }, { status: 400 });
  }

  const result = await sendConversationMessage(conversationId, currentUser.id, parsed.data.body);
  if (result === "not-found") return Response.json({ error: "Conversation not found." }, { status: 404 });
  if (result === "blocked") {
    return Response.json({ error: "Messaging is unavailable because one account has blocked the other." }, { status: 403 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
