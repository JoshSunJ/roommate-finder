import Link from "next/link";
import type { Listing } from "@/features/listings/types";

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  return (
    <Link className="listing-card" href={`/listings/${listing.id}`}>
      <p className="eyebrow">{listing.location}</p>
      <h3>{listing.title}</h3>
      <p>{listing.description}</p>
      <div className="listing-meta">
        <span>${listing.rent}/month</span>
        <span>{listing.bedrooms} bedrooms</span>
      </div>
    </Link>
  );
}
