"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/features/places/types";
import type { Listing } from "@/features/listings/types";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

type Props = {
  places: Place[];
  highlightedPlaceId: string;
  savedListings: Listing[];
};

export default function LocationMap({ places, highlightedPlaceId, savedListings }: Props) {
  return <MapInner places={places} highlightedPlaceId={highlightedPlaceId} savedListings={savedListings} />;
}
