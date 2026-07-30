import { getListingById } from "@/features/listings/service";

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
