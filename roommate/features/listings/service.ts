import prisma from "@/lib/prisma";
import type { CreateListingInput, Listing, ListingFilters } from "./types";

function toListing(record: Awaited<ReturnType<typeof prisma.listing.findFirst>>): Listing | undefined {
  if (!record) return undefined;

  return {
    id: record.id,
    title: record.title,
    rent: record.rent,
    location: record.location,
    description: record.description,
    bedrooms: record.bedrooms,
    bathroomType: record.bathroomType as Listing["bathroomType"],
    availableFrom: record.availableFrom,
    postedBy: record.postedBy,
    coordinates:
      record.latitude !== null && record.longitude !== null
        ? { latitude: record.latitude, longitude: record.longitude }
        : undefined,
  };
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const records = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
  });

  return filterListings(records.map((record) => toListing(record)!), filters);
}

export async function getListingById(id: number): Promise<Listing | undefined> {
  return toListing(await prisma.listing.findUnique({ where: { id } }));
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
  const records = await prisma.listing.findMany({
    distinct: ["location"],
    select: { location: true },
    orderBy: { location: "asc" },
  });

  return records.map((record) => record.location);
}

export async function createListing(input: CreateListingInput): Promise<Listing> {
  const record = await prisma.listing.create({
    data: input,
  });

  return toListing(record)!;
}
