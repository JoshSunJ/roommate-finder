"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { Place } from "@/features/places/types";

type Props = { places: Place[] };

const colors = { Campus: "#5a42d8", Company: "#e86c2d", Library: "#137a57", Groceries: "#b142a0" } as const;

export default function MapInner({ places }: Props) {
  return (
    <MapContainer center={[37.3352, -121.8811]} zoom={13} scrollWheelZoom className="location-map">
      <TileLayer attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {places.map((place) => (
        <CircleMarker key={place.id} center={[place.coordinates.latitude, place.coordinates.longitude]} pathOptions={{ color: colors[place.category], fillColor: colors[place.category], fillOpacity: 0.9 }} radius={9}>
          <Popup><strong>{place.name}</strong><br />{place.category}<br />{place.description}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
