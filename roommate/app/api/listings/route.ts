import { createListing, getListings } from "@/features/listings/service";
import type { CreateListingInput } from "@/features/listings/types";
import { getCurrentUser, isVerifiedUser } from "@/lib/current-user";

export async function GET() {
  return Response.json(await getListings());
}

export async function POST(request: Request) {
  const input = (await request.json()) as CreateListingInput;

  if (!input.title?.trim() || !input.location?.trim() || input.rent <= 0 || input.bedrooms <= 0) {
    return Response.json({ error: "Provide a title, location, positive rent, and bedroom count." }, { status: 400 });
  }

  const { coordinates } = input;
  const hasValidCoordinates =
    coordinates &&
    Number.isFinite(coordinates.latitude) &&
    Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 &&
    coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 &&
    coordinates.longitude <= 180;

  if (!hasValidCoordinates) {
    return Response.json(
      { error: "Select a valid listing location on the map." },
      { status: 400 },
    );
  }

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return Response.json({ error: "Sign in to post a listing." }, { status: 401 });
  }
  if (!isVerifiedUser(currentUser)) return Response.json({ error: "Verify your affiliation before posting a listing." }, { status: 403 });

  return Response.json(await createListing(input, currentUser), { status: 201 });
}
