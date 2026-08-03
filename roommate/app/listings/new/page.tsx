import Link from "next/link";
import { redirect } from "next/navigation";
import NewListingForm from "@/components/NewListingForm";
import { getCurrentUser } from "@/lib/current-user";

export default async function NewListingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/sign-in?next=/listings/new");
  }

  return <main className="page-shell detail"><Link href="/" className="back-link">← All listings</Link><h1>Create a listing</h1><p className="form-intro">Your listing is saved in the local database. Use the map to place a pin near the home; you never need to enter technical coordinates.</p><NewListingForm /></main>;
}
