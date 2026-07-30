import { getListings } from "@/features/listings/service";

export async function GET() {
  const listings = await getListings();

  return Response.json(listings);
}
