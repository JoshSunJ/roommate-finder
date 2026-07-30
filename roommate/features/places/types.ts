import type { Coordinates } from "@/features/listings/types";

export type PlaceCategory = "Campus" | "Company" | "Library" | "Groceries";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  coordinates: Coordinates;
  description: string;
}
