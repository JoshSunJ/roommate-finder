import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import HousingRequestForm from "@/components/HousingRequestForm";
import { getHousingRequestById } from "@/features/housing-requests/service";
import { getCurrentUser } from "@/lib/current-user";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditHousingRequestPage({ params }: PageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect(`/sign-in?next=/requests/${id}/edit`);

  const housingRequest = await getHousingRequestById(Number(id));
  if (!housingRequest || housingRequest.ownerId !== currentUser.id) notFound();

  return (
    <main className="page-shell detail">
      <Link href={`/requests/${housingRequest.id}`} className="back-link">← Cancel editing</Link>
      <h1>Edit housing request</h1>
      <p className="form-intro">
        Update the same request instead of posting a duplicate. Only the account that created it can save changes.
      </p>
      <HousingRequestForm mode="edit" housingRequest={housingRequest} />
    </main>
  );
}
