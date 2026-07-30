import { places } from "./data";
import { distanceInMiles } from "./distance";
import type { Place } from "./types";
import type { Coordinates } from "@/features/listings/types";

export async function getPlaces(): Promise<Place[]> {
  return places;
}

export async function getCampus(): Promise<Place> {
  return places.find((place) => place.id === "sjsu")!;
}

export function formatDistance(from: Coordinates, to: Coordinates): string {
  return `${distanceInMiles(from, to).toFixed(1)} mi straight-line`;
}
