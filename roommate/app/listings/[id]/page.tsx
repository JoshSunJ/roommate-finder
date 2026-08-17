import Link from "next/link";
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
        <p className="price">${listing.rent}/month</p>
        <p>{listing.description}</p>
        <ul className="details">
          <li><strong>{listing.bedrooms}</strong> bedrooms in the home</li>
          <li><strong>{listing.bathroomType}</strong> bathroom</li>
          <li>Available <strong>{listing.availableFrom}</strong></li>
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
        <p className="owner-notice">This is your listing. Manage it from your dashboard.</p>
      ) : currentUser ? (
        <>{contactBlocked ? <p className="owner-notice">Contact is disabled because one account has blocked the other.</p> : <InquiryForm listingId={listing.id} />}<SafetyActions targetType="listing" targetId={listing.id} ownerId={listing.ownerId} initiallyBlocked={ownerBlocked} /></>
      ) : (
        <p className="owner-notice"><Link href="/sign-in">Sign in</Link> to contact this poster.</p>
      )}
    </main>
  );
}
