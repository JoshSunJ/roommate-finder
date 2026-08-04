import {
  deleteListingForOwner,
  getListingById,
  updateListingStatusForOwner,
} from "@/features/listings/service";
import { getCurrentUser } from "@/lib/current-user";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const listing = await getListingById(Number(id));

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return Response.json(listing);
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const listingId = Number(id);

  if (!Number.isInteger(listingId) || listingId <= 0) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Sign in to manage listings." }, { status: 401 });
  }

  const wasDeleted = await deleteListingForOwner(listingId, currentUser.id);

  if (!wasDeleted) {
    // Do not reveal whether a non-owned listing exists.
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

export async function PATCH(request: Request, { params }: RouteProps) {
  const { id } = await params; const listingId = Number(id); const body = await request.json();
  if (!Number.isInteger(listingId) || !["active", "filled", "expired"].includes(body.status)) return Response.json({ error: "Invalid listing status." }, { status: 400 });
  const user = await getCurrentUser(); if (!user) return Response.json({ error: "Sign in to manage listings." }, { status: 401 });
  if (!await updateListingStatusForOwner(listingId, user.id, body.status)) return Response.json({ error: "Listing not found." }, { status: 404 });
  return Response.json({ ok: true });
}
