"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/features/places/types";

const MapInner = dynamic(() => import("./MapInner"), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

export default function LocationMap({ places }: { places: Place[] }) {
  return <MapInner places={places} />;
}
