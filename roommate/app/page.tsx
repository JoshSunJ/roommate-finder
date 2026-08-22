import Link from "next/link";

import Navbar from "@/components/Navbar";
import HomeCitySearch from "@/components/HomeCitySearch";
import ListingFilters from "@/components/ListingFilters";
import ListingWorkspace from "@/components/ListingWorkspace";
import { getListings } from "@/features/listings/service";
import { getCityPreference } from "@/features/location-search/server";
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
  const city = await getCityPreference();
  const filters: ListingFiltersType = {
    maxRent: toOptionalPositiveNumber(query.maxRent),
    location: typeof query.location === "string" ? query.location : undefined,
    minBedrooms: toOptionalPositiveNumber(query.minBedrooms),
    city,
  };

  const [listings, currentUser] = await Promise.all([
    getListings(filters),
    getCurrentUser(),
  ]);
  const locations = [...new Set(listings.map((listing) => listing.location))].sort();
  const savedListingIds = currentUser
    ? (await getSavedItemIds(currentUser.id)).listingIds
    : [];
  const requestedListingId = toOptionalPositiveNumber(query.listing);
  const initialSelectedListingId = listings.some(
    (listing) => listing.id === requestedListingId && listing.coordinates,
  )
    ? requestedListingId
    : undefined;

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <section className="hero hero--home">
          <div className="hero-copy">
            <p className="eyebrow">For university students and interns</p>
            <h1>
              Find your place.
              <br />
              <span>Know your route.</span>
            </h1>
            <p>
              Search housing around the school, company, commute, and everyday
              places that will shape your next move.
            </p>
            <HomeCitySearch city={city} />
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
          <div className="hero-city" aria-hidden="true">
            <div className="hero-city__sun" />
            <div className="hero-city__route hero-city__route--one" />
            <div className="hero-city__route hero-city__route--two" />
            <span className="hero-city__stop hero-city__stop--one">01</span>
            <span className="hero-city__stop hero-city__stop--two">02</span>
            <span className="hero-city__stop hero-city__stop--three">03</span>
            <div className="hero-city__buildings">
              <i /><i /><i /><i /><i />
            </div>
            <p>school → home → work</p>
          </div>
        </section>

        <section id="listings" aria-labelledby="available-listings">
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 · Available now</p>
              <h2 id="available-listings">Homes around {city.shortLabel}.</h2>
            </div>
            <p className="result-count"><strong>{listings.length}</strong> places found</p>
          </div>

          <ListingFilters filters={filters} locations={locations} />

          <ListingWorkspace
            listings={listings}
            savedListingIds={savedListingIds}
            signedIn={Boolean(currentUser)}
            initialSelectedListingId={initialSelectedListingId}
            focusCoordinates={city.coordinates}
          />

          {listings.length === 0 && (
            <p className="empty-state">No listings match those filters. Try clearing one.</p>
          )}
        </section>
      </main>
    </>
  );
}
