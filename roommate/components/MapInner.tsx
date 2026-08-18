"use client";

import { divIcon, icon } from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Place } from "@/features/places/types";
import type { Listing } from "@/features/listings/types";

type Props = {
  places: Place[];
  highlightedPlaceId: string;
  savedListings: Listing[];
};

const colors = { Campus: "#5a42d8", Company: "#e86c2d", Library: "#137a57", Groceries: "#b142a0" } as const;

const destinationFlagIcon = icon({
  // Files in /public are served from the site's root URL.
  iconUrl: "/flag.png",
  iconSize: [42, 42],
  // The pole tip is at the bottom-right portion of this particular image.
  iconAnchor: [31, 42],
  popupAnchor: [0, -40],
});

const savedHomeIcon = divIcon({
  className: "saved-home-marker",
  html: '<span aria-hidden="true">😍</span>',
  iconSize: [36, 36],
  iconAnchor: [18, 32],
  popupAnchor: [0, -30],
});

export default function MapInner({ places, highlightedPlaceId, savedListings }: Props) {
  return (
    <MapContainer center={[37.3352, -121.8811]} zoom={13} scrollWheelZoom className="location-map">
      <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {places.map((place) => {
        const isHighlighted = place.id === highlightedPlaceId;
        const position: [number, number] = [
          place.coordinates.latitude,
          place.coordinates.longitude,
        ];

        const popup = (
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.category}
            <br />
            {place.description}
          </Popup>
        );

        if (isHighlighted) {
          return (
            <Marker key={place.id} position={position} icon={destinationFlagIcon}>
              {popup}
            </Marker>
          );
        }

        return (
          <CircleMarker
            key={place.id}
            center={position}
            pathOptions={{
              color: colors[place.category],
              fillColor: colors[place.category],
              fillOpacity: 0.9,
            }}
            radius={9}
          >
            {popup}
          </CircleMarker>
        );
      })}
      {savedListings.flatMap((listing) => listing.coordinates ? [(
        <Marker
          key={`saved-listing-${listing.id}`}
          position={[listing.coordinates.latitude, listing.coordinates.longitude]}
          icon={savedHomeIcon}
        >
          <Popup><strong>Saved home</strong><br /><a href={`/listings/${listing.id}`}>{listing.title}</a><br />${listing.rent}/month</Popup>
        </Marker>
      )] : [])}
    </MapContainer>
  );
}
