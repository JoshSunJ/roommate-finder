import Link from "next/link";

import type { HousingRequest } from "@/features/housing-requests/types";

export default function HousingRequestCard({ request }: { request: HousingRequest }) {
  return (
    <Link href={`/requests/${request.id}`} className="housing-request-card">
      <div>
        <p className="eyebrow">Looking for a room</p>
        <h3>{request.title}</h3>
        <p>{request.description}</p>
      </div>
      <div className="housing-request-card__meta">
        <span>Up to ${request.maxRent}/mo</span>
        <span>{request.preferredLocation}</span>
        <span>{request.moveInDate} → {request.moveOutDate}</span>
      </div>
    </Link>
  );
}
