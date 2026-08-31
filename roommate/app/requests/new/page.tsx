import Link from "next/link";
import { redirect } from "next/navigation";

import HousingRequestForm from "@/components/HousingRequestForm";
import { getCurrentUser } from "@/lib/current-user";

export default async function NewHousingRequestPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in?next=/requests/new");

  return (
    <main className="page-shell detail">
      <Link href="/requests" className="back-link">← All housing requests</Link>
      <h1>Find a room</h1>
      <p className="form-intro">
        Describe the practical constraints of your search. Your request is public;
        only share details you would be comfortable showing to the community.
      </p>
      <HousingRequestForm mode="create" />
    </main>
  );
}
