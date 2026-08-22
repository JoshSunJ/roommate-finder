import type { Coordinates } from "@/features/listings/types";
import { distanceInMiles } from "@/features/places/distance";
import type { CommuteMode } from "@/features/preferences/types";
import type { CommuteEstimate } from "@/features/commute/types";

type ModeAssumption = {
  routeFactor: number;
  averageMilesPerHour: number;
  fixedMinutes: number;
  explanation: string;
};

const modeAssumptions: Record<CommuteMode, ModeAssumption> = {
  walk: {
    routeFactor: 1.12,
    averageMilesPerHour: 3,
    fixedMinutes: 0,
    explanation: "walking pace with a small street-network allowance",
  },
  bike: {
    routeFactor: 1.18,
    averageMilesPerHour: 11,
    fixedMinutes: 2,
    explanation: "casual cycling pace plus locking time",
  },
  drive: {
    routeFactor: 1.25,
    averageMilesPerHour: 24,
    fixedMinutes: 6,
    explanation: "city driving pace plus parking time",
  },
  transit: {
    routeFactor: 1.35,
    averageMilesPerHour: 14,
    fixedMinutes: 10,
    explanation: "urban transit pace plus an average wait and transfer buffer",
  },
  "ride share": {
    routeFactor: 1.25,
    averageMilesPerHour: 22,
    fixedMinutes: 7,
    explanation: "city traffic plus an average pickup wait",
  },
};

export function estimateCommute(
  origin: Coordinates,
  destination: Coordinates,
  mode: CommuteMode,
  maxCommuteMinutes: number,
): CommuteEstimate {
  const directDistance = distanceInMiles(origin, destination);
  const assumption = modeAssumptions[mode];
  const estimatedRouteDistance = directDistance * assumption.routeFactor;
  const durationMinutes = Math.max(
    1,
    Math.round(
      (estimatedRouteDistance / assumption.averageMilesPerHour) * 60
      + assumption.fixedMinutes,
    ),
  );

  return {
    mode,
    distanceMiles: Number(estimatedRouteDistance.toFixed(1)),
    durationMinutes,
    withinLimit: durationMinutes <= maxCommuteMinutes,
    explanation: assumption.explanation,
  };
}

export function compareCommuteModes(
  origin: Coordinates,
  destination: Coordinates,
  modes: CommuteMode[],
  maxCommuteMinutes: number,
) {
  return modes
    .map((mode) => estimateCommute(origin, destination, mode, maxCommuteMinutes))
    .sort((a, b) => a.durationMinutes - b.durationMinutes);
}
