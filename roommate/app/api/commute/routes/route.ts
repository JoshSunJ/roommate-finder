import type { NextRequest } from "next/server";

import {
  getOpenRouteServiceRoutes,
  getRoadRoutes,
  getValhallaRoutes,
} from "@/features/commute/routing";
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

  const openRouteServiceKey = process.env.OPENROUTESERVICE_API_KEY?.trim();
  const mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN?.trim();
  const valhallaUrl = process.env.VALHALLA_BASE_URL?.trim();

  if (!openRouteServiceKey && !mapboxAccessToken && !valhallaUrl) {
    return Response.json(
      { error: "Road routing is not configured for this environment." },
      { status: 503 },
    );
  }

  try {
    let routes;
    if (openRouteServiceKey) {
      routes = await getOpenRouteServiceRoutes(
        origin,
        destination,
        modes,
        openRouteServiceKey,
      );
    } else if (mapboxAccessToken) {
      routes = await getRoadRoutes(origin, destination, modes, mapboxAccessToken);
    } else if (valhallaUrl) {
      routes = await getValhallaRoutes(origin, destination, modes, valhallaUrl);
    } else {
      return Response.json(
        { error: "Road routing is not configured for this environment." },
        { status: 503 },
      );
    }
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
