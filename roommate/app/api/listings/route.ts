import { createListing, getListings } from "@/features/listings/service";
import type { CreateListingInput } from "@/features/listings/types";

export async function GET() {
  return Response.json(await getListings());
}

export async function POST(request: Request) {
  const input = (await request.json()) as CreateListingInput;
  if (!input.title?.trim() || !input.location?.trim() || input.rent <= 0 || input.bedrooms <= 0) {
    return Response.json({ error: "Provide a title, location, positive rent, and bedroom count." }, { status: 400 });
  }
  if (!Number.isFinite(input.coordinates?.latitude) || !Number.isFinite(input.coordinates?.longitude)) {
    return Response.json({ error: "Provide a valid latitude and longitude for the map." }, { status: 400 });
  }
  return Response.json(await createListing(input), { status: 201 });
}
