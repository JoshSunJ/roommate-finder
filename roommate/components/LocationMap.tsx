"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/features/places/types";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

type Props = {
  places: Place[];
  highlightedPlaceId: string;
};

export default function LocationMap({ places, highlightedPlaceId }: Props) {
  return <MapInner places={places} highlightedPlaceId={highlightedPlaceId} />;
}
