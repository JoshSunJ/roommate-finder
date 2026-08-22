import type { NextRequest } from "next/server";

import { getRoadRoutes } from "@/features/commute/routing";
import {
  isRoadRoutableMode,
  type RoadRoutableMode,
} from "@/features/commute/types";
import type { Coordinates } from "@/features/listings/types";

function parseCoordinates(value: string | null): Coordinates | null {
  if (!value) return null;
  const [longitude, latitude, ...extra] = value.split(",").map(Number);

  if (
    extra.length > 0
    || !Number.isFinite(longitude)
    || !Number.isFinite(latitude)
    || longitude < -180
    || longitude > 180
    || latitude < -90
    || latitude > 90
  ) {
    return null;
  }

  return { longitude, latitude };
}

function parseModes(value: string | null): RoadRoutableMode[] | null {
  if (!value) return null;
  const modes = value.split(",").map((mode) => mode.trim());
  if (modes.length === 0 || modes.length > 4 || !modes.every(isRoadRoutableMode)) {
    return null;
  }

  return [...new Set(modes)] as RoadRoutableMode[];
}

export async function GET(request: NextRequest) {
  const origin = parseCoordinates(request.nextUrl.searchParams.get("origin"));
  const destination = parseCoordinates(request.nextUrl.searchParams.get("destination"));
  const modes = parseModes(request.nextUrl.searchParams.get("modes"));

  if (!origin || !destination || !modes) {
    return Response.json(
      { error: "Provide valid origin, destination, and road travel modes." },
      { status: 400 },
    );
  }

  const accessToken = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return Response.json(
      { error: "Live road routing is not configured." },
      { status: 503 },
    );
  }

  try {
    const routes = await getRoadRoutes(origin, destination, modes, accessToken);
    return Response.json(
      { routes },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "The road routing provider could not calculate this trip." },
      { status: 502 },
    );
  }
}
