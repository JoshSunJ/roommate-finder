import Link from "next/link";
import { notFound } from "next/navigation";

import HousingRequestStatusControl from "@/components/HousingRequestStatusControl";
import LeadResponseForm from "@/components/LeadResponseForm";
import SafetyActions from "@/components/SafetyActions";
import { hasUserBlocked, isEitherUserBlocked } from "@/features/blocks/service";
import { getLeadResponsesForRequest } from "@/features/lead-responses/service";
import { getHousingRequestById } from "@/features/housing-requests/service";
import { getCurrentUser } from "@/lib/current-user";

type PageProps = { params: Promise<{ id: string }> };

export default async function HousingRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const request = await getHousingRequestById(Number(id));
  if (!request) notFound();
  const currentUser = await getCurrentUser();
  const leadResponses = currentUser?.id === request.ownerId ? await getLeadResponsesForRequest(request.id) : [];
  const contactBlocked = currentUser && currentUser.id !== request.ownerId ? await isEitherUserBlocked(currentUser.id, request.ownerId) : false;
  const ownerBlocked = currentUser && currentUser.id !== request.ownerId ? await hasUserBlocked(currentUser.id, request.ownerId) : false;

  return (
    <main className="page-shell detail">
      <Link href="/requests" className="back-link">← All housing requests</Link>
      <article className="detail-card">
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
        <><HousingRequestStatusControl requestId={request.id} currentStatus={request.status} />{leadResponses.map((lead) => <article className="inquiry-form" key={lead.id}><p className="eyebrow">Lead from {lead.sender.name}</p><p>{lead.message}</p><a href={`mailto:${lead.sender.email}`}>Reply by email ↗</a></article>)}</>
      ) : (
        currentUser ? <>{contactBlocked ? <p className="owner-notice">Contact is disabled because one account has blocked the other.</p> : <LeadResponseForm housingRequestId={request.id} />}<SafetyActions targetType="housing_request" targetId={request.id} ownerId={request.ownerId} initiallyBlocked={ownerBlocked} /></> : <p className="owner-notice"><Link href="/sign-in">Sign in</Link> to share a lead.</p>
      )}
    </main>
  );
}
