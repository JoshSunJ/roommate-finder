import type {
  LocationSearchInput,
  LocationSearchResult,
} from "@/features/location-search/types";

type MapTilerFeature = {
  id?: string;
  type?: string;
  place_type?: string[];
  text?: string;
  place_name?: string;
  center?: [number, number];
  bbox?: [number, number, number, number];
};

type MapTilerResponse = { features?: MapTilerFeature[] };

export function buildMapTilerSearchUrl(
  input: LocationSearchInput,
  apiKey: string,
) {
  const url = new URL(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(input.query)}.json`,
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("country", "us");
  url.searchParams.set("language", "en");
  url.searchParams.set("worldview", "us");
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "7");

  if (input.kind === "city") url.searchParams.set("types", "place");
  if (input.kind === "destination") url.searchParams.set("types", "poi");
  if (input.proximity) {
    url.searchParams.set(
      "proximity",
      `${input.proximity.longitude},${input.proximity.latitude}`,
    );
  }

  return url;
}

export function normalizeMapTilerResults(
  data: MapTilerResponse,
): LocationSearchResult[] {
  return (data.features ?? []).flatMap((feature) => {
    if (!feature.center) return [];
    const [longitude, latitude] = feature.center;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return [];

    const label = feature.place_name ?? feature.text;
    if (!label) return [];

    return [{
      id: feature.id ?? `${longitude},${latitude}`,
      label,
      shortLabel: feature.text ?? label,
      type: feature.place_type?.[0] ?? feature.type ?? "place",
      coordinates: { latitude, longitude },
      boundingBox: feature.bbox,
    }];
  });
}

export async function searchLocations(
  input: LocationSearchInput,
  apiKey: string,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher(buildMapTilerSearchUrl(input, apiKey), {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`MapTiler search failed with status ${response.status}.`);
  }

  return normalizeMapTilerResults(await response.json() as MapTilerResponse);
}
