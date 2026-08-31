import {
  deleteHousingRequestForOwner,
  updateHousingRequestForOwner,
  updateHousingRequestStatusForOwner,
} from "@/features/housing-requests/service";
import {
  housingRequestInputSchema,
  housingRequestStatusSchema,
} from "@/features/housing-requests/schema";
import { getCurrentUser } from "@/lib/current-user";

type RouteProps = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Sign in to manage a housing request." }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  const parsed = housingRequestStatusSchema.safeParse(
    await request.json().catch(() => null),
  );

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

export async function PUT(request: Request, { params }: RouteProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Sign in to edit a housing request." }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  const parsed = housingRequestInputSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!Number.isInteger(requestId) || requestId <= 0 || !parsed.success) {
    return Response.json(
      { error: "Check the title, budget, location, dates, bedrooms, and description." },
      { status: 400 },
    );
  }

  const updatedRequest = await updateHousingRequestForOwner(
    requestId,
    currentUser.id,
    parsed.data,
  );

  if (!updatedRequest) {
    return Response.json({ error: "Housing request not found." }, { status: 404 });
  }

  return Response.json(updatedRequest);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Sign in to delete a housing request." }, { status: 401 });
  }

  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return Response.json({ error: "Provide a valid housing request." }, { status: 400 });
  }

  const wasDeleted = await deleteHousingRequestForOwner(requestId, currentUser.id);
  if (!wasDeleted) {
    return Response.json({ error: "Housing request not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
