"use client";

import {
    CircleMarker,
    MapContainer,
    Popup,
    TileLayer,
    useMapEvents,
} from "react-leaflet";
import type { Coordinates } from "@/features/listings/types";

type Props = {
    value: Coordinates | null;
    onChange: (coordinates: Coordinates) => void;
};

const sanJoseCenter: [number, number] = [37.3352, -121.8811];

function MapClickHandler({ onChange }: Pick<Props, "onChange">) {
    useMapEvents({
        click(event) {
            onChange({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            });
        },
    });

    return null;
}

export default function ListingLocationPickerInner({ value, onChange }: Props) {
    return (
        <MapContainer
            center={sanJoseCenter}
            zoom={13}
            scrollWheelZoom
            className="listing-location-map"
            style={{ height: "340px" }}
            aria-label="Choose the listing location on the map"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onChange={onChange} />
            {value && (
                <CircleMarker
                    center={[value.latitude, value.longitude]}
                    radius={10}
                    pathOptions={{
                        color: "#d9ff4a",
                        fillColor: "#d9ff4a",
                        fillOpacity: 1,
                        weight: 3,
                    }}
                >
                    <Popup>Listing location</Popup>
                </CircleMarker>
            )}
        </MapContainer>
    );
}
