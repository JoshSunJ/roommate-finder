import { z } from "zod";

import { updateHousingRequestStatusForOwner } from "@/features/housing-requests/service";
import { getCurrentUser } from "@/lib/current-user";

const statusSchema = z.object({
  status: z.enum(["active", "matched", "closed"]),
});

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Sign in to manage a housing request." }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  const parsed = statusSchema.safeParse(await request.json());

  if (!Number.isInteger(requestId) || requestId <= 0 || !parsed.success) {
    return Response.json({ error: "Provide a valid request status." }, { status: 400 });
  }

  const wasUpdated = await updateHousingRequestStatusForOwner(
    requestId,
    currentUser.id,
    parsed.data.status,
  );

  if (!wasUpdated) {
    return Response.json({ error: "Housing request not found." }, { status: 404 });
  }

  return Response.json({ ok: true });
}
