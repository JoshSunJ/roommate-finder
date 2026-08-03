import prisma from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { CurrentUser } from "@/lib/current-user";
import type { CreateListingInput, Listing, ListingFilters } from "./types";

const listingWithOwner = {
  include: { owner: true },
} satisfies Prisma.ListingDefaultArgs;

type ListingRecord = Prisma.ListingGetPayload<typeof listingWithOwner>;

function toListing(record: ListingRecord | null): Listing | undefined {
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
    // The relationship is now the source of truth for a listing's poster.
    postedBy: record.owner.name,
    coordinates:
      record.latitude !== null && record.longitude !== null
        ? { latitude: record.latitude, longitude: record.longitude }
        : undefined,
  };
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  const records = await prisma.listing.findMany({
    ...listingWithOwner,
    orderBy: { createdAt: "desc" },
  });

  return filterListings(records.map((record) => toListing(record)!), filters);
}

export async function getListingById(id: number): Promise<Listing | undefined> {
  return toListing(await prisma.listing.findUnique({
    ...listingWithOwner,
    where: { id },
  }));
}

export async function getListingsForOwner(ownerId: number): Promise<Listing[]> {
  const records = await prisma.listing.findMany({
    ...listingWithOwner,
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });

  return records.map((record) => toListing(record)!);
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

export async function createListing(
  input: CreateListingInput,
  owner: CurrentUser,
): Promise<Listing> {
  const { coordinates, ...listingData } = input;

  const record = await prisma.listing.create({
    ...listingWithOwner,
    data: {
      ...listingData,
      postedBy: owner.name,
      owner: { connect: { id: owner.id } },
      latitude: coordinates?.latitude,
      longitude: coordinates?.longitude,
    },
  });

  return toListing(record)!;
}

export async function deleteListingForOwner(
  listingId: number,
  ownerId: number,
): Promise<boolean> {
  // Combining id and ownerId in one database operation makes the ownership
  // check atomic: no caller can delete another person's listing.
  const result = await prisma.listing.deleteMany({
    where: { id: listingId, ownerId },
  });

  return result.count === 1;
}
