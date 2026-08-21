"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";

import { mapStyle } from "@/features/map/config";
import type { Listing } from "@/features/listings/types";
import type { Place } from "@/features/places/types";

type Props = {
  places: Place[];
  highlightedPlaceId: string;
  savedListings: Listing[];
};

type SelectedMarker =
  | { kind: "place"; id: string }
  | { kind: "listing"; id: number }
  | null;

export default function MapInner({
  places,
  highlightedPlaceId,
  savedListings,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>(null);
  const highlightedPlace = useMemo(
    () => places.find((place) => place.id === highlightedPlaceId) ?? places[0],
    [highlightedPlaceId, places],
  );
  const selectedPlace = selectedMarker?.kind === "place"
    ? places.find((place) => place.id === selectedMarker.id)
    : undefined;
  const selectedListing = selectedMarker?.kind === "listing"
    ? savedListings.find((listing) => listing.id === selectedMarker.id)
    : undefined;

  useEffect(() => {
    if (!highlightedPlace) return;
    mapRef.current?.flyTo({
      center: [
        highlightedPlace.coordinates.longitude,
        highlightedPlace.coordinates.latitude,
      ],
      zoom: 13.5,
      duration: 800,
    });
  }, [highlightedPlace]);

  return (
    <div className="location-map">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -121.8811, latitude: 37.3352, zoom: 12.5 }}
        mapStyle={mapStyle}
        reuseMaps
        onClick={() => setSelectedMarker(null)}
        aria-label="Area map showing destinations and saved homes"
      >
        <NavigationControl position="top-right" showCompass={false} />

        {places.map((place) => {
          const isDestination = place.id === highlightedPlaceId;
          return (
            <Marker
              key={place.id}
              longitude={place.coordinates.longitude}
              latitude={place.coordinates.latitude}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                setSelectedMarker({ kind: "place", id: place.id });
              }}
            >
              <button
                type="button"
                className={`area-marker area-marker--${place.category.toLowerCase()}${isDestination ? " area-marker--destination" : ""}`}
                aria-label={`${place.name}, ${place.category}`}
              >
                {isDestination ? (
                  <Image
                    src="/flag.png"
                    alt=""
                    width={52}
                    height={52}
                    className="area-marker__flag"
                  />
                ) : place.category.slice(0, 1)}
              </button>
            </Marker>
          );
        })}

        {savedListings.flatMap((listing) => listing.coordinates ? [(
          <Marker
            key={`saved-listing-${listing.id}`}
            longitude={listing.coordinates.longitude}
            latitude={listing.coordinates.latitude}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelectedMarker({ kind: "listing", id: listing.id });
            }}
          >
            <button type="button" className="area-marker area-marker--saved" aria-label={`Saved home: ${listing.title}`}>
              ♥
            </button>
          </Marker>
        )] : [])}

        {selectedPlace && (
          <Popup
            longitude={selectedPlace.coordinates.longitude}
            latitude={selectedPlace.coordinates.latitude}
            anchor="bottom"
            offset={18}
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
          >
            <article className="area-popup">
              <p>{selectedPlace.category}</p>
              <h3>{selectedPlace.name}</h3>
              <span>{selectedPlace.description}</span>
            </article>
          </Popup>
        )}

        {selectedListing?.coordinates && (
          <Popup
            longitude={selectedListing.coordinates.longitude}
            latitude={selectedListing.coordinates.latitude}
            anchor="bottom"
            offset={18}
            closeOnClick={false}
            onClose={() => setSelectedMarker(null)}
          >
            <article className="area-popup">
              <p>Saved home</p>
              <h3>{selectedListing.title}</h3>
              <span>${selectedListing.rent}/month</span>
              <Link href={`/listings/${selectedListing.id}`}>View home ↗</Link>
            </article>
          </Popup>
        )}
      </Map>

      <div className="area-map-legend">
        <span><i className="legend-destination" />Destination</span>
        <span><i className="legend-home" />Saved home</span>
      </div>
    </div>
  );
}
