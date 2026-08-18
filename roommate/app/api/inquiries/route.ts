import { z } from "zod";

import { startConversation } from "@/features/conversations/service";
import { getCurrentUser, isVerifiedUser } from "@/lib/current-user";

const inquirySchema = z.object({
  listingId: z.number().int().positive(),
  message: z.string().trim().min(10).max(1_000),
});

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: "Sign in to contact a poster." }, { status: 401 });
  if (!isVerifiedUser(currentUser)) return Response.json({ error: "Verify your affiliation before contacting a poster." }, { status: 403 });

  const parsed = inquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Write a message between 10 and 1,000 characters." }, { status: 400 });
  }

  const result = await startConversation(parsed.data, currentUser.id);
  if (result.kind === "listing-not-found") return Response.json({ error: "Listing not found." }, { status: 404 });
  if (result.kind === "own-listing") {
    return Response.json({ error: "You cannot contact yourself about your own listing." }, { status: 403 });
  }
  if (result.kind === "blocked") return Response.json({ error: "Contact is unavailable because one of these accounts has blocked the other." }, { status: 403 });

  return Response.json({ conversationId: result.conversationId }, { status: 201 });
}
