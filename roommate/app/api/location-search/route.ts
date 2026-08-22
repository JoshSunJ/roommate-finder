import type { NextRequest } from "next/server";

import { searchLocations } from "@/features/location-search/service";
import type { LocationSearchKind } from "@/features/location-search/types";

const validKinds = new Set<LocationSearchKind>([
  "city",
  "destination",
  "address",
]);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const requestedKind = request.nextUrl.searchParams.get("kind") ?? "address";

  if (query.length < 2 || query.length > 120) {
    return Response.json(
      { error: "Search with between 2 and 120 characters." },
      { status: 400 },
    );
  }

  if (!validKinds.has(requestedKind as LocationSearchKind)) {
    return Response.json({ error: "Unsupported search type." }, { status: 400 });
  }

  const apiKey = process.env.MAPTILER_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { error: "Location search is not configured yet." },
      { status: 503 },
    );
  }

  const rawLongitude = request.nextUrl.searchParams.get("longitude");
  const rawLatitude = request.nextUrl.searchParams.get("latitude");
  const longitude = rawLongitude === null ? undefined : Number(rawLongitude);
  const latitude = rawLatitude === null ? undefined : Number(rawLatitude);
  const proximity = longitude !== undefined
    && latitude !== undefined
    && Number.isFinite(longitude)
    && Number.isFinite(latitude)
    && longitude >= -180
    && longitude <= 180
    && latitude >= -90
    && latitude <= 90
    ? { longitude, latitude }
    : undefined;

  try {
    const results = await searchLocations({
      query,
      kind: requestedKind as LocationSearchKind,
      proximity,
    }, apiKey);

    return Response.json({ results });
  } catch {
    return Response.json(
      { error: "The location provider could not complete this search." },
      { status: 502 },
    );
  }
}
