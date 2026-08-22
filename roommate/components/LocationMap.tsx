"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/features/places/types";
import type { Coordinates, Listing } from "@/features/listings/types";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

type Props = {
  places: Place[];
  highlightedPlaceId: string;
  savedListings: Listing[];
  selectedHomeId: number | null;
  onSelectSavedHome: (listingId: number) => void;
  focusCoordinates: Coordinates;
};

export default function LocationMap({ places, highlightedPlaceId, savedListings, selectedHomeId, onSelectSavedHome, focusCoordinates }: Props) {
  return <MapInner places={places} highlightedPlaceId={highlightedPlaceId} savedListings={savedListings} selectedHomeId={selectedHomeId} onSelectSavedHome={onSelectSavedHome} focusCoordinates={focusCoordinates} />;
}
