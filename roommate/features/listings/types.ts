export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Listing {
  id: number;
  ownerId: number;
  title: string;
  rent: number;
  location: string;
  description: string;
  bedrooms: number;
  bathroomType: "Private" | "Shared";
  availableFrom: string;
  postedBy: string;
  // Coordinates are derived map data, not form fields a poster must understand.
  coordinates?: Coordinates;
}

export interface ListingFilters {
  maxRent?: number;
  location?: string;
  minBedrooms?: number;
}

export type CreateListingInput = Omit<Listing, "id" | "ownerId" | "postedBy">;
