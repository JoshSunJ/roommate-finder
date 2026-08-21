"use client";

import dynamic from "next/dynamic";

import type { Listing } from "@/features/listings/types";

const ListingExplorerMapInner = dynamic(
  () => import("@/features/map/components/HousingMap"),
  {
    ssr: false,
    loading: () => <div className="map-loading">Loading listing map…</div>,
  },
);

type Props = {
  listings: Listing[];
  savedListingIds: number[];
  selectedListingId?: number | null;
  onSelectListing?: (listingId: number | null) => void;
};

export default function ListingExplorerMap({
  listings,
  savedListingIds,
  selectedListingId,
  onSelectListing,
}: Props) {
  // A listing created before map placement existed can still appear as a card,
  // but cannot truthfully be drawn as a map pin.
  const mappableListings = listings.filter((listing) => listing.coordinates);

  return (
    <ListingExplorerMapInner
      listings={mappableListings}
      savedListingIds={savedListingIds}
      selectedListingId={selectedListingId}
      onSelectListing={onSelectListing}
    />
  );
}
