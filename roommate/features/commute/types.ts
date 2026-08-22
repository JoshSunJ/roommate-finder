import type { CommuteMode } from "@/features/preferences/types";

export type CommuteEstimate = {
  mode: CommuteMode;
  distanceMiles: number;
  durationMinutes: number;
  withinLimit: boolean;
  explanation: string;
};
