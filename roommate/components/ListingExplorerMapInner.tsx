"use client";

import { useRouter } from "next/navigation";
import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";

import type { Listing } from "@/features/listings/types";

type Props = {
  listings: Listing[];
};

const sanJoseCenter: [number, number] = [37.3352, -121.8811];

export default function ListingExplorerMapInner({ listings }: Props) {
  const router = useRouter();

  return (
    <MapContainer
      center={sanJoseCenter}
      zoom={13}
      scrollWheelZoom
      className="listing-explorer-map"
      style={{ height: "620px" }}
      aria-label="Map of available listings"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {listings.map((listing) => {
        // ListingExplorerMap filters out coordinate-less listings before this
        // component runs, so this assertion is safe at this rendering boundary.
        const coordinates = listing.coordinates!;

        return (
          <CircleMarker
            key={listing.id}
            center={[coordinates.latitude, coordinates.longitude]}
            radius={11}
            pathOptions={{
              color: "#090909",
              fillColor: "#d9ff4a",
              fillOpacity: 1,
              weight: 3,
            }}
            eventHandlers={{
              click: () => router.push(`/listings/${listing.id}`),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              {listing.title} · ${listing.rent}/month
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
