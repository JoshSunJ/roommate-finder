import Link from "next/link";
import type { Listing } from "@/features/listings/types";

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  return (
    <Link className="listing-card" href={`/listings/${listing.id}`}>
      <div className={`listing-visual listing-visual--${listing.id}`}>
        <span className="listing-visual__type">Room · {listing.bathroomType.toLowerCase()} bath</span>
        <span className="listing-visual__arrow" aria-hidden="true">↗</span>
        <span className="listing-visual__shape listing-visual__shape--one" />
        <span className="listing-visual__shape listing-visual__shape--two" />
      </div>
      <div className="listing-card__content">
        <p className="eyebrow">{listing.location}</p>
        <h3>{listing.title}</h3>
        <p>{listing.description}</p>
      </div>
      <div className="listing-meta">
        <span>${listing.rent}/month</span>
        <span>{listing.bedrooms} bedrooms</span>
      </div>
    </Link>
  );
}
