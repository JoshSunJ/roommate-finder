import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import InquiryForm from "@/components/InquiryForm";
import SafetyActions from "@/components/SafetyActions";
import { hasUserBlocked, isEitherUserBlocked } from "@/features/blocks/service";
import { getListingById } from "@/features/listings/service";
import { formatDistance, getCampus } from "@/features/places/service";
import { getCurrentUser } from "@/lib/current-user";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(Number(id));

  if (!listing) {
    notFound();
  }
  const campus = await getCampus();
  const currentUser = await getCurrentUser();
  const contactBlocked = currentUser && currentUser.id !== listing.ownerId ? await isEitherUserBlocked(currentUser.id, listing.ownerId) : false;
  const ownerBlocked = currentUser && currentUser.id !== listing.ownerId ? await hasUserBlocked(currentUser.id, listing.ownerId) : false;

  return (
    <main className="page-shell detail">
      <Link href="/" className="back-link">← All listings</Link>
      <article className="detail-card">
        <p className="eyebrow">{listing.location}</p>
        <h1>{listing.title}</h1>
        {listing.photos.length > 0 && (
          <div className="listing-gallery" aria-label="Listing photos">
            {listing.photos.map((photo, index) => (
              <div className={index === 0 ? "listing-gallery__photo listing-gallery__photo--cover" : "listing-gallery__photo"} key={photo.id}>
                <Image src={photo.url} alt={photo.altText} fill priority={index === 0} sizes={index === 0 ? "(max-width: 820px) 100vw, 540px" : "(max-width: 820px) 50vw, 260px"} />
              </div>
            ))}
          </div>
        )}
        <p className="price">${listing.rent}/month</p>
        <p>{listing.description}</p>
        <ul className="details">
          <li><strong>{listing.bedrooms}</strong> bedrooms in the home</li>
          <li><strong>{listing.bathroomType}</strong> bathroom</li>
          <li>Available <strong>{listing.availableFrom}</strong>{listing.availableUntil ? <> through <strong>{listing.availableUntil}</strong></> : null}</li>
          <li><strong>{listing.roomType.replaceAll("_", " ")}</strong></li>
          <li><strong>{listing.leaseType.replaceAll("_", " ")}</strong> lease</li>
          <li>{listing.furnished ? "Furnished" : "Unfurnished"}</li>
          <li>{listing.utilitiesIncluded ? "Utilities included" : listing.utilitiesEstimate !== null ? <>Estimated utilities <strong>${listing.utilitiesEstimate}/month</strong></> : "Utilities not specified"}</li>
          <li>{listing.securityDeposit !== null ? <>Security deposit <strong>${listing.securityDeposit}</strong></> : "Deposit not specified"}</li>
          <li>{listing.parkingAvailable ? "Parking available" : "No parking listed"}</li>
          <li>{listing.petsAllowed ? "Pets allowed" : "Pets not allowed"}</li>
          <li>Posted by <strong>{listing.postedBy}</strong></li>
          <li>
            {listing.coordinates ? (
              <><strong>{formatDistance(listing.coordinates, campus.coordinates)}</strong> from SJSU</>
            ) : (
              "Map distance will be available after the listing address is verified."
            )}
          </li>
        </ul>
      </article>
      {currentUser?.id === listing.ownerId ? (
        <p className="owner-notice">This is your listing. <Link href={`/listings/${listing.id}/edit`}>Edit its details</Link> or manage its status from your dashboard.</p>
      ) : currentUser ? (
        <>{contactBlocked ? <p className="owner-notice">Contact is disabled because one account has blocked the other.</p> : <InquiryForm listingId={listing.id} />}<SafetyActions targetType="listing" targetId={listing.id} ownerId={listing.ownerId} initiallyBlocked={ownerBlocked} /></>
      ) : (
        <p className="owner-notice"><Link href="/sign-in">Sign in</Link> to contact this poster.</p>
      )}
    </main>
  );
}
