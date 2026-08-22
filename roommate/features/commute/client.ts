import type { Coordinates } from "@/features/listings/types";
import type { CommuteMode } from "@/features/preferences/types";
import {
  isRoadRoutableMode,
  type CommuteRoute,
} from "@/features/commute/types";

type CommuteRouteResponse = {
  routes?: CommuteRoute[];
  error?: string;
};

type RequestRoadRoutesInput = {
  origin: Coordinates;
  destination: Coordinates;
  modes: CommuteMode[];
  signal?: AbortSignal;
};

export async function requestRoadRoutes({
  origin,
  destination,
  modes,
  signal,
}: RequestRoadRoutesInput): Promise<CommuteRoute[]> {
  const roadModes = modes.filter(isRoadRoutableMode);
  if (roadModes.length === 0) return [];

  const searchParams = new URLSearchParams({
    origin: `${origin.longitude},${origin.latitude}`,
    destination: `${destination.longitude},${destination.latitude}`,
    modes: roadModes.join(","),
  });
  const response = await fetch(`/api/commute/routes?${searchParams}`, {
    signal,
    cache: "no-store",
  });
  const body = await response.json() as CommuteRouteResponse;

  if (!response.ok || !body.routes) {
    throw new Error(body.error ?? "Live road routes are unavailable.");
  }

  return body.routes;
}
