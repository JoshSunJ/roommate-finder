"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/maplibre";

import { mapStyle } from "@/features/map/config";
import {
  toListingFeatureCollection,
  type ListingMapProperties,
} from "@/features/map/listing-geojson";
import type { Listing } from "@/features/listings/types";

type Props = {
  listings: Listing[];
  savedListingIds: number[];
};

type SelectedListing = ListingMapProperties & {
  longitude: number;
  latitude: number;
};

export default function HousingMap({ listings, savedListingIds }: Props) {
  const mapRef = useRef<MapRef>(null);
  const [selectedListing, setSelectedListing] = useState<SelectedListing | null>(null);
  const [mapState, setMapState] = useState<"loading" | "ready" | "error">("loading");
  const listingData = useMemo(
    () => toListingFeatureCollection(listings, savedListingIds),
    [listings, savedListingIds],
  );

  useEffect(() => {
    if (mapState !== "loading") return;

    const timeout = window.setTimeout(() => setMapState("error"), 8_000);
    return () => window.clearTimeout(timeout);
  }, [mapState]);

  return (
    <div
      className="housing-map-shell"
      data-map-state={mapState}
      data-feature-count={listingData.features.length}
      aria-busy={mapState === "loading"}
    >
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -121.8811, latitude: 37.3352, zoom: 12.5 }}
        mapStyle={mapStyle}
        onClick={() => setSelectedListing(null)}
        onLoad={() => setMapState("ready")}
        onStyleData={() => setMapState("ready")}
        reuseMaps
        aria-label="Map of available housing listings"
      >
        <NavigationControl position="top-right" showCompass={false} />

        {listingData.features.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          const listing = feature.properties;

          return (
            <Marker
              key={listing.id}
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                setSelectedListing({ ...listing, longitude, latitude });
              }}
            >
              <button
                type="button"
                className={`housing-map-marker${listing.isSaved ? " housing-map-marker--saved" : ""}`}
                aria-label={`Open ${listing.title}, $${listing.rent} per month`}
              >
                {listing.isSaved ? "♥" : `$${listing.rent}`}
              </button>
            </Marker>
          );
        })}

        {selectedListing && (
          <Popup
            longitude={selectedListing.longitude}
            latitude={selectedListing.latitude}
            anchor="bottom"
            offset={16}
            closeOnClick={false}
            onClose={() => setSelectedListing(null)}
          >
            <article className="housing-map-popup">
              <p>{selectedListing.isSaved ? "Saved home" : "Available home"}</p>
              <h3>{selectedListing.title}</h3>
              <span>{selectedListing.location}</span>
              <strong>${selectedListing.rent}/month · {selectedListing.bedrooms} bed</strong>
              <Link href={`/listings/${selectedListing.id}`}>View listing ↗</Link>
            </article>
          </Popup>
        )}
      </Map>

      {mapState === "error" && (
        <p className="housing-map-error" role="status">
          The map style could not load. The housing cards are still available.
        </p>
      )}

      <div className="housing-map-legend" aria-label="Map legend">
        <span><i className="housing-map-legend__available" />Available</span>
        <span><i className="housing-map-legend__saved" />Saved</span>
      </div>
    </div>
  );
}
