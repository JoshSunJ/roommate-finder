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
  availableUntil: string | null;
  roomType: "private" | "shared" | "entire_place";
  leaseType: "sublet" | "month_to_month" | "fixed_term";
  furnished: boolean;
  utilitiesIncluded: boolean;
  utilitiesEstimate: number | null;
  securityDeposit: number | null;
  parkingAvailable: boolean;
  petsAllowed: boolean;
  postedBy: string;
  status: "active" | "filled" | "expired";
  // Coordinates are derived map data, not form fields a poster must understand.
  coordinates?: Coordinates;
}

export interface ListingFilters {
  maxRent?: number;
  location?: string;
  minBedrooms?: number;
}

export type CreateListingInput = Omit<
  Listing,
  "id" | "ownerId" | "postedBy" | "status" | "coordinates"
> & { coordinates: Coordinates };
