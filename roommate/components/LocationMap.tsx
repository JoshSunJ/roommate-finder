"use client";

import dynamic from "next/dynamic";
import type { CommuteRoute } from "@/features/commute/types";
import type { Place } from "@/features/places/types";
import type { Coordinates, Listing } from "@/features/listings/types";
import type { CommuteMode } from "@/features/preferences/types";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

type Props = {
  places: Place[];
  highlightedPlaceId: string;
  savedListings: Listing[];
  selectedHomeId: number | null;
  onSelectSavedHome: (listingId: number) => void;
  focusCoordinates: Coordinates;
  roadRoute: CommuteRoute | null;
  displayedMode: CommuteMode;
};

export default function LocationMap({ places, highlightedPlaceId, savedListings, selectedHomeId, onSelectSavedHome, focusCoordinates, roadRoute, displayedMode }: Props) {
  return <MapInner places={places} highlightedPlaceId={highlightedPlaceId} savedListings={savedListings} selectedHomeId={selectedHomeId} onSelectSavedHome={onSelectSavedHome} focusCoordinates={focusCoordinates} roadRoute={roadRoute} displayedMode={displayedMode} />;
}
