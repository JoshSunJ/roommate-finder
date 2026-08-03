import {
  deleteListingForOwner,
  getListingById,
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
  const wasDeleted = await deleteListingForOwner(listingId, currentUser.id);

  if (!wasDeleted) {
    // Do not reveal whether a non-owned listing exists.
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
