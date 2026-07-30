import { listings } from "./data";
import type { CreateListingInput, Listing, ListingFilters } from "./types";

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  return filterListings(listings, filters);
}

export async function getListingById(id: number): Promise<Listing | undefined> {
  return listings.find((listing) => listing.id === id);
}

export function filterListings(listingsToFilter: Listing[], filters: ListingFilters): Listing[] {
  return listingsToFilter.filter((listing) => {
    const isWithinBudget = filters.maxRent === undefined || listing.rent <= filters.maxRent;
    const isInLocation = !filters.location || listing.location === filters.location;
    const hasEnoughBedrooms = filters.minBedrooms === undefined || listing.bedrooms >= filters.minBedrooms;
    return isWithinBudget && isInLocation && hasEnoughBedrooms;
  });
}

export async function getListingLocations(): Promise<string[]> {
  return [...new Set(listings.map((listing) => listing.location))].sort();
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const listing = { ...input, id: Math.max(0, ...listings.map((item) => item.id)) + 1 };
  // Temporary development-only storage. A server restart clears this array.
  listings.push(listing);
  return listing;
}
