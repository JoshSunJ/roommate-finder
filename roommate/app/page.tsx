import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import ListingFilters from "@/components/ListingFilters";
import {
  getListingLocations,
  getListings,
} from "@/features/listings/service";
import type { ListingFilters as ListingFiltersType } from "@/features/listings/types";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

  const [listings, locations] = await Promise.all([
    getListings(filters),
    getListingLocations(),
  ]);

  return (
    <>
      <Navbar />
      <main className="page-shell">
        <section className="hero">
          <p className="eyebrow">Find your next home</p>
          <h1>Roommate Finder</h1>
          <p>
            Browse available rooms near campus. Matching and messaging can come
            later—first, make it easy to discover a place to live.
          </p>
        </section>

        <section aria-labelledby="available-listings">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Available now</p>
              <h2 id="available-listings">Listings</h2>
            </div>
            <p>{listings.length} places found</p>
          </div>

          <ListingFilters filters={filters} locations={locations} />

          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {listings.length === 0 && (
            <p className="empty-state">No listings match those filters. Try clearing one.</p>
          )}
        </section>
      </main>
    </>
  );
}
