import Link from "next/link";

import Navbar from "@/components/Navbar";
import SaveableHousingRequestCard from "@/components/SaveableHousingRequestCard";
import { getHousingRequests } from "@/features/housing-requests/service";
import { getCurrentUser } from "@/lib/current-user";
import { getSavedItemIds } from "@/features/saved-items/service";

export default async function HousingRequestsPage() {
  const [requests, currentUser] = await Promise.all([
    getHousingRequests(),
    getCurrentUser(),
  ]);
  const savedRequestIds = currentUser
    ? (await getSavedItemIds(currentUser.id)).housingRequestIds
    : [];
  const savedRequestIdSet = new Set(savedRequestIds);

  return (
    <>
      <Navbar />
      <main className="page-shell requests-page">
        <section className="section-heading">
          <div>
            <p className="eyebrow">The other side of housing</p>
            <h1>People looking for a room.</h1>
            <p className="form-intro">
              See what verified community members need, then share a direct room,
              lease takeover, or credible housing lead.
            </p>
          </div>
          {currentUser ? (
            <Link className="button button--primary" href="/requests/new">Post your request ↗</Link>
          ) : (
            <Link className="button button--primary" href="/sign-in?next=/requests/new">Sign in to post ↗</Link>
          )}
        </section>

        {requests.length === 0 ? (
          <p className="empty-state">No active housing requests yet. Be the first to post one.</p>
        ) : (
          <div className="housing-request-grid">
            {requests.map((request) => <SaveableHousingRequestCard key={request.id} request={request} isSaved={savedRequestIdSet.has(request.id)} signedIn={Boolean(currentUser)} />)}
          </div>
        )}
      </main>
    </>
  );
}
