import type { Coordinates } from "@/features/listings/types";

const EARTH_RADIUS_KM = 6371;
const MILES_PER_KILOMETER = 0.621371;

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function distanceInMiles(from: Coordinates, to: Coordinates): number {
  const latitudeDifference = degreesToRadians(to.latitude - from.latitude);
  const longitudeDifference = degreesToRadians(to.longitude - from.longitude);
  const latitudeOne = degreesToRadians(from.latitude);
  const latitudeTwo = degreesToRadians(to.latitude);
  const haversine = Math.sin(latitudeDifference / 2) ** 2 + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDifference / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine)) * MILES_PER_KILOMETER;
}
