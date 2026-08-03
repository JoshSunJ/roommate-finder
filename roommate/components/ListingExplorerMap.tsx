"use client";

import dynamic from "next/dynamic";

import type { Listing } from "@/features/listings/types";

const ListingExplorerMapInner = dynamic(
  () => import("./ListingExplorerMapInner"),
  {
    ssr: false,
    loading: () => <div className="map-loading">Loading listing map…</div>,
  },
);

type Props = {
  listings: Listing[];
};

export default function ListingExplorerMap({ listings }: Props) {
  // A listing created before map placement existed can still appear as a card,
  // but cannot truthfully be drawn as a map pin.
  const mappableListings = listings.filter((listing) => listing.coordinates);

  return <ListingExplorerMapInner listings={mappableListings} />;
}
