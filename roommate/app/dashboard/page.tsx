import Navbar from "@/components/Navbar";
import Link from "next/link";
import DeleteListingButton from "@/components/DeleteListingButton";
import ListingStatusControl from "@/components/ListingStatusControl";
import ListingCard from "@/components/ListingCard";
import HousingRequestCard from "@/components/HousingRequestCard";
import { getHousingRequestsForOwner } from "@/features/housing-requests/service";
import { getListingsForOwner } from "@/features/listings/service";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in?next=/dashboard");
  }

  const [listings, housingRequests] = await Promise.all([
    getListingsForOwner(currentUser.id),
    getHousingRequestsForOwner(currentUser.id),
  ]);

  return (
    <>
      <Navbar />
      <main className="page-shell dashboard">
        <p className="eyebrow">Your workspace</p>
        <h1>My listings</h1>
        <p className="form-intro">
          Signed in as {currentUser.name}. These are the listings this account
          owns.
        </p>

        {listings.length === 0 ? (
          <p className="empty-state">You have not posted a listing yet.</p>
        ) : (
          <div className="dashboard-listings">
            {listings.map((listing) => (
              <article key={listing.id}>
                <ListingCard listing={listing} />
                <Link className="listing-edit-link" href={`/listings/${listing.id}/edit`}>Edit details ↗</Link>
                <ListingStatusControl listingId={listing.id} currentStatus={listing.status} />
                <DeleteListingButton listingId={listing.id} />
              </article>
            ))}
          </div>
        )}

        <section className="dashboard-requests" aria-labelledby="my-housing-requests">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Seeking a room</p>
              <h2 id="my-housing-requests">My housing requests</h2>
            </div>
          </div>
          {housingRequests.length === 0 ? (
            <p className="empty-state">You have not posted a housing request yet.</p>
          ) : (
            <div className="housing-request-grid">
              {housingRequests.map((request) => (
                <HousingRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
