import Link from "next/link";
import { notFound } from "next/navigation";

import HousingRequestStatusControl from "@/components/HousingRequestStatusControl";
import DeleteHousingRequestButton from "@/components/DeleteHousingRequestButton";
import HousingRequestContactForm from "@/components/HousingRequestContactForm";
import ListingRecommendationCard from "@/components/ListingRecommendationCard";
import SafetyActions from "@/components/SafetyActions";
import SaveItemButton from "@/components/SaveItemButton";
import { hasUserBlocked, isEitherUserBlocked } from "@/features/blocks/service";
import { getHousingRequestById } from "@/features/housing-requests/service";
import { getListings } from "@/features/listings/service";
import { rankListingsForRequest } from "@/features/matching/service";
import { getCurrentUser } from "@/lib/current-user";
import { isItemSaved } from "@/features/saved-items/service";

type PageProps = { params: Promise<{ id: string }> };

export default async function HousingRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const request = await getHousingRequestById(Number(id));
  if (!request) notFound();
  const currentUser = await getCurrentUser();
  const isSaved = currentUser
    ? await isItemSaved(currentUser.id, { targetType: "housing_request", targetId: request.id })
    : false;
  const contactBlocked = currentUser && currentUser.id !== request.ownerId ? await isEitherUserBlocked(currentUser.id, request.ownerId) : false;
  const ownerBlocked = currentUser && currentUser.id !== request.ownerId ? await hasUserBlocked(currentUser.id, request.ownerId) : false;
  const recommendations = currentUser?.id === request.ownerId
    ? rankListingsForRequest(request, await getListings()).slice(0, 6)
    : [];

  return (
    <main className="page-shell detail">
      <Link href="/requests" className="back-link">← All housing requests</Link>
      <article className="detail-card">
        <div className="detail-save-action"><SaveItemButton targetType="housing_request" targetId={request.id} initialSaved={isSaved} signedIn={Boolean(currentUser)} /></div>
        <p className="eyebrow">Looking for a room · {request.status}</p>
        <h1>{request.title}</h1>
        <p className="price">Up to ${request.maxRent}/month</p>
        <p>{request.description}</p>
        <ul className="details">
          <li>Preferred area <strong>{request.preferredLocation}</strong></li>
          <li>Needs <strong>{request.bedroomsNeeded}</strong> bedroom</li>
          <li>Move in <strong>{request.moveInDate}</strong></li>
          <li>Move out <strong>{request.moveOutDate}</strong></li>
          <li>Requested by <strong>{request.requestedBy}</strong></li>
        </ul>
      </article>
      {currentUser?.id === request.ownerId ? (
        <>
          <div className="listing-management">
            <Link className="listing-edit-link" href={`/requests/${request.id}/edit`}>Edit request ↗</Link>
            <DeleteHousingRequestButton requestId={request.id} />
          </div>
          <HousingRequestStatusControl requestId={request.id} currentStatus={request.status} />
          <section className="match-results" aria-labelledby="recommended-homes">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Practical recommendations</p>
                <h2 id="recommended-homes">Homes ranked for this request</h2>
                <p className="form-intro">Every active option is scored transparently. Stretch choices stay visible so you—not an algorithm—decide which tradeoffs are acceptable.</p>
              </div>
            </div>
            {recommendations.length === 0
              ? <p className="empty-state">No active homes from other posters are available to compare yet.</p>
              : <div className="match-grid">{recommendations.map((recommendation) => <ListingRecommendationCard key={recommendation.listing.id} recommendation={recommendation} />)}</div>}
          </section>
          <p className="owner-notice">
            New housing leads appear as private threads in your <Link href="/inquiries">inbox</Link>.
          </p>
        </>
      ) : (
        currentUser ? <>{contactBlocked ? <p className="owner-notice">Contact is disabled because one account has blocked the other.</p> : <HousingRequestContactForm housingRequestId={request.id} />}<SafetyActions targetType="housing_request" targetId={request.id} ownerId={request.ownerId} initiallyBlocked={ownerBlocked} /></> : <p className="owner-notice"><Link href="/sign-in">Sign in</Link> to share a lead.</p>
      )}
    </main>
  );
}
