import type { FeatureCollection, Point } from "geojson";

import type { Listing } from "@/features/listings/types";

export type ListingMapProperties = {
  id: number;
  title: string;
  location: string;
  rent: number;
  bedrooms: number;
  isSaved: boolean;
};

export function toListingFeatureCollection(
  listings: Listing[],
  savedListingIds: number[],
): FeatureCollection<Point, ListingMapProperties> {
  const savedListingIdSet = new Set(savedListingIds);

  return {
    type: "FeatureCollection",
    features: listings.flatMap((listing) => {
      if (!listing.coordinates) return [];

      return [{
        type: "Feature" as const,
        id: listing.id,
        geometry: {
          type: "Point" as const,
          // GeoJSON uses [longitude, latitude], the reverse of Leaflet's
          // [latitude, longitude] convention.
          coordinates: [
            listing.coordinates.longitude,
            listing.coordinates.latitude,
          ],
        },
        properties: {
          id: listing.id,
          title: listing.title,
          location: listing.location,
          rent: listing.rent,
          bedrooms: listing.bedrooms,
          isSaved: savedListingIdSet.has(listing.id),
        },
      }];
    }),
  };
}

