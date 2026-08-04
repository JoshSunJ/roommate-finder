import Link from "next/link";
import { notFound } from "next/navigation";

import HousingRequestStatusControl from "@/components/HousingRequestStatusControl";
import { getHousingRequestById } from "@/features/housing-requests/service";
import { getCurrentUser } from "@/lib/current-user";

type PageProps = { params: Promise<{ id: string }> };

export default async function HousingRequestDetailPage({ params }: PageProps) {
  const { id } = await params;
  const request = await getHousingRequestById(Number(id));
  if (!request) notFound();
  const currentUser = await getCurrentUser();

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
        <HousingRequestStatusControl
          requestId={request.id}
          currentStatus={request.status}
        />
      ) : (
        <p className="owner-notice">
          Have a relevant room or housing lead? Direct contact for requests is the next
          marketplace interaction we will add.
        </p>
      )}
    </main>
  );
}
