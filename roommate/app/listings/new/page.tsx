import Link from "next/link";
import NewListingForm from "@/components/NewListingForm";

export default function NewListingPage() {
  return <main className="page-shell detail"><Link href="/" className="back-link">← All listings</Link><h1>Create a listing</h1><p className="form-intro">This prototype saves data only while the development server is running. The coordinate fields will become a map pin selector or address lookup later.</p><NewListingForm /></main>;
}
