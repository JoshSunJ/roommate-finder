import Link from "next/link";

import Navbar from "@/components/Navbar";
import ListingExplorerMap from "@/components/ListingExplorerMap";
import ListingFilters from "@/components/ListingFilters";
import SaveableListingCard from "@/components/SaveableListingCard";
import {
  getListingLocations,
  getListings,
} from "@/features/listings/service";
import type { ListingFilters as ListingFiltersType } from "@/features/listings/types";
import { getSavedItemIds } from "@/features/saved-items/service";
import { getCurrentUser } from "@/lib/current-user";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// the page validates numeric values before calling the service:
function toOptionalPositiveNumber(value: string | string[] | undefined) {
  if (typeof value !== "string") return undefined;

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

export default async function Home({ searchParams }: PageProps) {
  const query = await searchParams;
  const filters: ListingFiltersType = {
    maxRent: toOptionalPositiveNumber(query.maxRent),
    location: typeof query.location === "string" ? query.location : undefined,
    minBedrooms: toOptionalPositiveNumber(query.minBedrooms),
  };

  const [listings, locations, currentUser] = await Promise.all([
    getListings(filters),
    getListingLocations(),
    getCurrentUser(),
  ]);
  const savedListingIds = currentUser
    ? (await getSavedItemIds(currentUser.id)).listingIds
    : [];
  const savedListingIdSet = new Set(savedListingIds);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <section className="hero hero--home">
          <div className="hero-copy">
            <p className="eyebrow">San Jose · housing, mapped</p>
            <h1>
              Live closer.
              <br />
              <span>Move smarter.</span>
            </h1>
            <p>
              Find a room that works with your commute, your budget, and the
              places that make a new city feel like home.
            </p>
            <div className="hero-actions">
              <a className="button button--primary" href="#listings">
                Explore homes <span aria-hidden="true">↘</span>
              </a>
              <a className="button button--quiet" href="/map">
                Explore the area <span aria-hidden="true">↗</span>
              </a>
              <Link className="button button--quiet" href="/requests">
                Browse requests <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <span className="orbit-label orbit-label--top">CITY GUIDE</span>
            <span className="orbit-label orbit-label--bottom">YOUR NEXT MOVE</span>
            <span className="orbit-core">RF</span>
            <span className="orbit-dot orbit-dot--one" />
            <span className="orbit-dot orbit-dot--two" />
          </div>
        </section>

        <section id="listings" aria-labelledby="available-listings">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 · Available now</p>
              <h2 id="available-listings">Homes worth the commute.</h2>
            </div>
            <p className="result-count"><strong>{listings.length}</strong> places found</p>
          </div>

          <ListingFilters filters={filters} locations={locations} />

          <div className="listing-workspace">
            <div className="listing-results">
              <div className="listing-explorer__heading"><p className="eyebrow">Results</p><p>Open a home for full details.</p></div>
              <div className="listing-grid">
                {listings.map((listing) => <SaveableListingCard key={listing.id} listing={listing} isSaved={savedListingIdSet.has(listing.id)} signedIn={Boolean(currentUser)} />)}
              </div>
            </div>
            <aside className="listing-explorer">
              <div className="listing-explorer__heading"><p className="eyebrow">Map view</p><p>Click a pin to open its listing.</p></div>
              <ListingExplorerMap listings={listings} savedListingIds={savedListingIds} />
            </aside>
          </div>

          {listings.length === 0 && (
            <p className="empty-state">No listings match those filters. Try clearing one.</p>
          )}
        </section>
      </main>
    </>
  );
}
