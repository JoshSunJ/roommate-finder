import Navbar from "@/components/Navbar";
import MapSelector from "@/components/MapSelector";
import { getPlaces } from "@/features/places/service";
import { getSavedItemIds } from "@/features/saved-items/service";
import { getListingsByIds } from "@/features/listings/service";
import { getCurrentUser } from "@/lib/current-user";

export default async function MapPage() {
  const places = await getPlaces();
  const currentUser = await getCurrentUser();
  const savedIds = currentUser ? await getSavedItemIds(currentUser.id) : { listingIds: [], housingRequestIds: [] };
  const savedListings = await getListingsByIds(savedIds.listingIds);
  return (
    <>
      <Navbar />
      <main className="explore-page">
        <header className="explore-heading">
          <p className="eyebrow">Explore the area</p>
          <h1>Build a life around the right place.</h1>
          <p>Start with a student or intern routine, then compare saved homes with the places you need every day.</p>
        </header>
        <MapSelector places={places} savedListings={savedListings} />
      </main>
    </>
  );
}
