import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import ListingForm from "@/components/ListingForm";
import { getListingById } from "@/features/listings/service";
import { getCurrentUser } from "@/lib/current-user";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();
  const { id } = await params;

  if (!currentUser) redirect(`/sign-in?next=/listings/${id}/edit`);

  const listing = await getListingById(Number(id));
  if (!listing || listing.ownerId !== currentUser.id) notFound();

  return (
    <main className="page-shell detail">
      <Link href={`/listings/${listing.id}`} className="back-link">← Cancel editing</Link>
      <h1>Edit listing</h1>
      <p className="form-intro">Changes update the existing listing; they do not create a duplicate. Only the owning account can complete this operation.</p>
      <ListingForm mode="edit" listing={listing} />
    </main>
  );
}
