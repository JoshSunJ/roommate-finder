import type { Coordinates } from "@/features/listings/types";
import type {
  CommuteRoute,
  RoadRoutableMode,
} from "@/features/commute/types";

type MapboxProfile = "driving" | "cycling" | "walking";
type OpenRouteServiceProfile = "driving-car" | "cycling-regular" | "foot-walking";
type ValhallaCosting = "auto" | "bicycle" | "pedestrian";

type MapboxDirectionsResponse = {
  code?: string;
  message?: string;
  routes?: Array<{
    distance?: number;
    duration?: number;
    geometry?: {
      type?: string;
      coordinates?: unknown;
    };
  }>;
};

type OpenRouteServiceResponse = {
  error?: { message?: string } | string;
  features?: Array<{
    geometry?: {
      type?: string;
      coordinates?: unknown;
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
    };
  }>;
};

type ValhallaRouteResponse = {
  error?: string;
  trip?: {
    status?: number;
    status_message?: string;
    summary?: {
      length?: number;
      time?: number;
    };
    legs?: Array<{ shape?: string }>;
  };
};

const profileByMode: Record<RoadRoutableMode, MapboxProfile> = {
  drive: "driving",
  bike: "cycling",
  walk: "walking",
  "ride share": "driving",
};

const fixedMinutesByMode: Record<RoadRoutableMode, number> = {
  drive: 0,
  bike: 0,
  walk: 0,
  "ride share": 7,
};

const openRouteServiceProfileByMode: Record<RoadRoutableMode, OpenRouteServiceProfile> = {
  drive: "driving-car",
  bike: "cycling-regular",
  walk: "foot-walking",
  "ride share": "driving-car",
};

const valhallaCostingByMode: Record<RoadRoutableMode, ValhallaCosting> = {
  drive: "auto",
  bike: "bicycle",
  walk: "pedestrian",
  "ride share": "auto",
};

function isLineCoordinates(value: unknown): value is [number, number][] {
  return Array.isArray(value)
    && value.length >= 2
    && value.every((coordinate) =>
      Array.isArray(coordinate)
      && coordinate.length >= 2
      && Number.isFinite(coordinate[0])
      && Number.isFinite(coordinate[1]),
    );
}

function routeDurationMinutes(durationSeconds: number, mode: RoadRoutableMode) {
  return Math.max(
    1,
    Math.round(durationSeconds / 60) + fixedMinutesByMode[mode],
  );
}

function decodePolyline6(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  function decodeValue() {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      if (index >= encoded.length) {
        throw new Error("The routing provider returned a malformed route shape.");
      }
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    return (result & 1) === 1 ? ~(result >> 1) : result >> 1;
  }

  while (index < encoded.length) {
    latitude += decodeValue();
    longitude += decodeValue();
    coordinates.push([longitude / 1_000_000, latitude / 1_000_000]);
  }

  if (coordinates.length < 2) {
    throw new Error("The routing provider returned an empty route shape.");
  }

  return coordinates;
}

export async function getRoadRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: RoadRoutableMode,
  accessToken: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<CommuteRoute> {
  const profile = profileByMode[mode];
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinates}`);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("geometries", "geojson");
  url.searchParams.set("overview", "full");
  url.searchParams.set("steps", "false");

  const response = await fetchImplementation(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const body = await response.json() as MapboxDirectionsResponse;
  const route = body.routes?.[0];

  if (
    !response.ok
    || body.code !== "Ok"
    || !route
    || !Number.isFinite(route.distance)
    || !Number.isFinite(route.duration)
    || route.geometry?.type !== "LineString"
    || !isLineCoordinates(route.geometry.coordinates)
  ) {
    throw new Error(body.message ?? "The routing provider returned an invalid route.");
  }

  return {
    mode,
    distanceMiles: Number((route.distance! / 1609.344).toFixed(1)),
    durationMinutes: routeDurationMinutes(route.duration!, mode),
    geometry: {
      type: "LineString",
      coordinates: route.geometry.coordinates,
    },
    provider: "mapbox",
  };
}

export async function getOpenRouteServiceRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: RoadRoutableMode,
  apiKey: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<CommuteRoute> {
  const profile = openRouteServiceProfileByMode[mode];
  const response = await fetchImplementation(
    `https://api.openrouteservice.org/v2/directions/${profile}/geojson`,
    {
      method: "POST",
      headers: {
        Accept: "application/geo+json, application/json",
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude],
        ],
        instructions: false,
      }),
      cache: "no-store",
    },
  );
  const body = await response.json() as OpenRouteServiceResponse;
  const feature = body.features?.[0];
  const summary = feature?.properties?.summary;
  const distanceMeters = summary?.distance;
  const durationSeconds = summary?.duration;

  if (
    !response.ok
    || feature?.geometry?.type !== "LineString"
    || !isLineCoordinates(feature.geometry.coordinates)
    || typeof distanceMeters !== "number"
    || !Number.isFinite(distanceMeters)
    || typeof durationSeconds !== "number"
    || !Number.isFinite(durationSeconds)
  ) {
    const providerMessage = typeof body.error === "string"
      ? body.error
      : body.error?.message;
    throw new Error(providerMessage ?? "OpenRouteService returned an invalid route.");
  }

  return {
    mode,
    distanceMiles: Number((distanceMeters / 1609.344).toFixed(1)),
    durationMinutes: routeDurationMinutes(durationSeconds, mode),
    geometry: {
      type: "LineString",
      coordinates: feature.geometry.coordinates,
    },
    provider: "openrouteservice",
  };
}

export async function getOpenRouteServiceRoutes(
  origin: Coordinates,
  destination: Coordinates,
  modes: RoadRoutableMode[],
  apiKey: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<CommuteRoute[]> {
  const uniqueModes = [...new Set(modes)];
  return Promise.all(uniqueModes.map((mode) =>
    getOpenRouteServiceRoute(origin, destination, mode, apiKey, fetchImplementation),
  ));
}

export async function getValhallaRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: RoadRoutableMode,
  baseUrl: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<CommuteRoute> {
  const url = new URL("route", `${baseUrl.replace(/\/+$/, "")}/`);
  const response = await fetchImplementation(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Client-Id": "unitern",
    },
    body: JSON.stringify({
      locations: [
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: destination.latitude, longitude: destination.longitude },
      ].map(({ latitude, longitude }) => ({ lat: latitude, lon: longitude })),
      costing: valhallaCostingByMode[mode],
      directions_type: "none",
      units: "miles",
    }),
    cache: "no-store",
  });
  const body = await response.json() as ValhallaRouteResponse;
  const summary = body.trip?.summary;
  const shape = body.trip?.legs?.[0]?.shape;
  const distanceMiles = summary?.length;
  const durationSeconds = summary?.time;

  if (
    !response.ok
    || body.trip?.status !== 0
    || typeof distanceMiles !== "number"
    || !Number.isFinite(distanceMiles)
    || typeof durationSeconds !== "number"
    || !Number.isFinite(durationSeconds)
    || typeof shape !== "string"
  ) {
    throw new Error(body.error ?? body.trip?.status_message ?? "Valhalla returned an invalid route.");
  }

  return {
    mode,
    distanceMiles: Number(distanceMiles.toFixed(1)),
    durationMinutes: routeDurationMinutes(durationSeconds, mode),
    geometry: {
      type: "LineString",
      coordinates: decodePolyline6(shape),
    },
    provider: "valhalla",
  };
}

export async function getValhallaRoutes(
  origin: Coordinates,
  destination: Coordinates,
  modes: RoadRoutableMode[],
  baseUrl: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<CommuteRoute[]> {
  const routes: CommuteRoute[] = [];

  // Sequential calls avoid surprising bursts against whichever Valhalla host is configured.
  for (const mode of new Set(modes)) {
    routes.push(await getValhallaRoute(
      origin,
      destination,
      mode,
      baseUrl,
      fetchImplementation,
    ));
  }

  return routes;
}

export async function getRoadRoutes(
  origin: Coordinates,
  destination: Coordinates,
  modes: RoadRoutableMode[],
  accessToken: string,
  fetchImplementation: typeof fetch = fetch,
): Promise<CommuteRoute[]> {
  const uniqueModes = [...new Set(modes)];

  return Promise.all(uniqueModes.map((mode) =>
    getRoadRoute(origin, destination, mode, accessToken, fetchImplementation),
  ));
}
