import { listings } from "./data";
import type { Listing, ListingFilters } from "./types";

export async function getListings(
  filters: ListingFilters = {},
): Promise<Listing[]> {
  return filterListings(listings, filters);
}

export async function getListingById(id: number): Promise<Listing | undefined> {
  return listings.find((listing) => listing.id === id);
}


export function filterListings(
  listingsToFilter: Listing[],
  filters: ListingFilters,
): Listing[] {
  return listingsToFilter.filter((listing) => {
    const isWithinBudget =
      filters.maxRent === undefined || listing.rent <= filters.maxRent;
    const isInLocation =
      !filters.location || listing.location === filters.location;
    const hasEnoughBedrooms =
      filters.minBedrooms === undefined ||
      listing.bedrooms >= filters.minBedrooms;

    // A listing must pass every active filter, so users get the intersection
    // of their choices: budget AND location AND bedroom requirement.
    return isWithinBudget && isInLocation && hasEnoughBedrooms;
  });
}

export async function getListingLocations(): Promise<string[]> {
  return [...new Set(listings.map((listing) => listing.location))].sort();
}
