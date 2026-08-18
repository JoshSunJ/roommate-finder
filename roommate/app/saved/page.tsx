import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import SaveableHousingRequestCard from "@/components/SaveableHousingRequestCard";
import SaveableListingCard from "@/components/SaveableListingCard";
import { getHousingRequestsByIds } from "@/features/housing-requests/service";
import { getListingsByIds } from "@/features/listings/service";
import { getSavedItemIds } from "@/features/saved-items/service";
import { getCurrentUser } from "@/lib/current-user";

export default async function SavedHousingPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in?next=/saved");

  const ids = await getSavedItemIds(currentUser.id);
  const [listings, requests] = await Promise.all([
    getListingsByIds(ids.listingIds),
    getHousingRequestsByIds(ids.housingRequestIds),
  ]);

  return (
    <>
      <Navbar />
      <main className="page-shell saved-page">
        <p className="eyebrow">Your shortlist</p>
        <h1>Saved housing</h1>
        <p className="form-intro">Keep promising homes and relevant housing requests together while you compare options.</p>

        <section aria-labelledby="saved-listings">
          <div className="section-heading">
            <div><p className="eyebrow">Available rooms</p><h2 id="saved-listings">Saved listings</h2></div>
            <p className="result-count"><strong>{listings.length}</strong> saved</p>
          </div>
          {listings.length === 0
            ? <p className="empty-state">You have not saved any available rooms yet.</p>
            : <div className="listing-grid">{listings.map((listing) => <SaveableListingCard key={listing.id} listing={listing} isSaved signedIn />)}</div>}
        </section>

        <section aria-labelledby="saved-requests">
          <div className="section-heading">
            <div><p className="eyebrow">People seeking rooms</p><h2 id="saved-requests">Saved housing requests</h2></div>
            <p className="result-count"><strong>{requests.length}</strong> saved</p>
          </div>
          {requests.length === 0
            ? <p className="empty-state">You have not saved any housing requests yet.</p>
            : <div className="housing-request-grid">{requests.map((request) => <SaveableHousingRequestCard key={request.id} request={request} isSaved signedIn />)}</div>}
        </section>
      </main>
    </>
  );
}
