"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/features/places/types";
import type { Coordinates, Listing } from "@/features/listings/types";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

type Props = {
  places: Place[];
  highlightedPlaceId: string;
  savedListings: Listing[];
  focusCoordinates: Coordinates;
};

export default function LocationMap({ places, highlightedPlaceId, savedListings, focusCoordinates }: Props) {
  return <MapInner places={places} highlightedPlaceId={highlightedPlaceId} savedListings={savedListings} focusCoordinates={focusCoordinates} />;
}
