import Navbar from "@/components/Navbar";
import DeleteListingButton from "@/components/DeleteListingButton";
import ListingCard from "@/components/ListingCard";
import { getListingsForOwner } from "@/features/listings/service";
import { getCurrentUser } from "@/lib/current-user";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in?next=/dashboard");
  }

  const listings = await getListingsForOwner(currentUser.id);

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
                <DeleteListingButton listingId={listing.id} />
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
