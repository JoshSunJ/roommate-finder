"use client";

import { useCallback, useState } from "react";

import ListingExplorerMap from "@/components/ListingExplorerMap";
import SaveableListingCard from "@/components/SaveableListingCard";
import type { Coordinates, Listing } from "@/features/listings/types";

type Props = {
  listings: Listing[];
  savedListingIds: number[];
  signedIn: boolean;
  initialSelectedListingId?: number;
  focusCoordinates: Coordinates;
};

export default function ListingWorkspace({
  listings,
  savedListingIds,
  signedIn,
  initialSelectedListingId,
  focusCoordinates,
}: Props) {
  const [selectedListingId, setSelectedListingId] = useState<number | null>(
    initialSelectedListingId ?? null,
  );
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const savedListingIdSet = new Set(savedListingIds);

  const updateSelectedListingUrl = useCallback((listingId: number | null) => {
    const url = new URL(window.location.href);

    if (listingId === null) {
      url.searchParams.delete("listing");
    } else {
      url.searchParams.set("listing", String(listingId));
    }

    window.history.replaceState(window.history.state, "", url);
  }, []);

  const selectFromMap = useCallback(
    (listingId: number | null) => {
      setSelectedListingId(listingId);
      updateSelectedListingUrl(listingId);
    },
    [updateSelectedListingUrl],
  );

  const showListingOnMap = useCallback(
    (listingId: number) => {
      setSelectedListingId(listingId);
      setMobileView("map");
      updateSelectedListingUrl(listingId);
    },
    [updateSelectedListingUrl],
  );

  return (
    <>
      <div className="listing-workspace-toggle" aria-label="Choose a results view">
        <button
          type="button"
          className={mobileView === "list" ? "is-active" : undefined}
          aria-pressed={mobileView === "list"}
          onClick={() => setMobileView("list")}
        >
          List
        </button>
        <button
          type="button"
          className={mobileView === "map" ? "is-active" : undefined}
          aria-pressed={mobileView === "map"}
          onClick={() => setMobileView("map")}
        >
          Map
        </button>
      </div>

      <div className="listing-workspace" data-mobile-view={mobileView}>
        <div className="listing-results">
          <div className="listing-explorer__heading">
            <p className="eyebrow">Results</p>
            <p>Choose “Show on map” to compare its location.</p>
          </div>
          <div className="listing-grid">
            {listings.map((listing) => (
              <SaveableListingCard
                key={listing.id}
                listing={listing}
                isSaved={savedListingIdSet.has(listing.id)}
                signedIn={signedIn}
                isSelected={selectedListingId === listing.id}
                onPreview={() => setSelectedListingId(listing.id)}
                onShowOnMap={() => showListingOnMap(listing.id)}
              />
            ))}
          </div>
        </div>

        <aside className="listing-explorer">
          <div className="listing-explorer__heading">
            <p className="eyebrow">Map view</p>
            <p>Select a pin to compare it with the results.</p>
          </div>
          <ListingExplorerMap
            listings={listings}
            savedListingIds={savedListingIds}
            selectedListingId={selectedListingId}
            onSelectListing={selectFromMap}
            focusCoordinates={focusCoordinates}
          />
        </aside>
      </div>
    </>
  );
}
