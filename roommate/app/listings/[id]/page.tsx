import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/features/listings/service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListingById(Number(id));

  if (!listing) {
    notFound();
  }

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
        </ul>
      </article>
    </main>
  );
}
