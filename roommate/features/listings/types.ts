export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Listing {
  id: number;
  title: string;
  rent: number;
  location: string;
  description: string;
  bedrooms: number;
  bathroomType: "Private" | "Shared";
  availableFrom: string;
  postedBy: string;
  coordinates: Coordinates;
}

export interface ListingFilters {
  maxRent?: number;
  location?: string;
  minBedrooms?: number;
}

export type CreateListingInput = Omit<Listing, "id">;
