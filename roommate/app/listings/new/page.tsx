import Link from "next/link";
import NewListingForm from "@/components/NewListingForm";

export default function NewListingPage() {
  return <main className="page-shell detail"><Link href="/" className="back-link">← All listings</Link><h1>Create a listing</h1><p className="form-intro">Your listing is saved in the local database. Map placement will be added later through an address lookup, so you do not need to enter technical coordinates.</p><NewListingForm /></main>;
}
