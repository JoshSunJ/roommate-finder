import { z } from "zod";

import { saveItem, unsaveItem } from "@/features/saved-items/service";
import { getCurrentUser } from "@/lib/current-user";

const targetSchema = z.object({
  targetType: z.enum(["listing", "housing_request"]),
  targetId: z.number().int().positive(),
});

async function parseRequest(request: Request) {
  return targetSchema.safeParse(await request.json().catch(() => null));
}

export async function PUT(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: "Sign in to save housing." }, { status: 401 });

  const parsed = await parseRequest(request);
  if (!parsed.success) return Response.json({ error: "Provide a valid item to save." }, { status: 400 });
  const result = await saveItem(currentUser.id, parsed.data);
  if (result === "not-found") return Response.json({ error: "Item not found." }, { status: 404 });
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return Response.json({ error: "Sign in to manage saved housing." }, { status: 401 });

  const parsed = await parseRequest(request);
  if (!parsed.success) return Response.json({ error: "Provide a valid saved item." }, { status: 400 });
  await unsaveItem(currentUser.id, parsed.data);
  return new Response(null, { status: 204 });
}
