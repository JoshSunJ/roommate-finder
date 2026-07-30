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
}

// These are optional because a visitor may choose any combination of filters.
// This is separate from Listing because filters describe a search, not a home.
export interface ListingFilters {
  maxRent?: number;
  location?: string;
  minBedrooms?: number;
}
