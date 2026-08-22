import Navbar from "@/components/Navbar";
import MapSelector from "@/components/MapSelector";
import { getPlaces } from "@/features/places/service";
import { getSavedItemIds } from "@/features/saved-items/service";
import { getListingsByIds } from "@/features/listings/service";
import { getCurrentUser } from "@/lib/current-user";
import { getCityPreference } from "@/features/location-search/server";

export default async function MapPage() {
  const [places, currentUser, city] = await Promise.all([
    getPlaces(),
    getCurrentUser(),
    getCityPreference(),
  ]);
  const savedIds = currentUser ? await getSavedItemIds(currentUser.id) : { listingIds: [], housingRequestIds: [] };
  const savedListings = await getListingsByIds(savedIds.listingIds);
  return (
    <>
      <Navbar />
      <main className="explore-page">
        <header className="explore-heading">
          <p className="eyebrow">Explore the area</p>
          <h1>Build a life around {city.shortLabel}.</h1>
          <p>Start with a student or intern routine, then compare saved homes with the places you need every day.</p>
        </header>
        <MapSelector places={places} savedListings={savedListings} city={city} />
      </main>
    </>
  );
}
