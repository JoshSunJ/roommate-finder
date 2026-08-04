import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { getReceivedInquiries } from "@/features/inquiries/service";
import { getCurrentUser } from "@/lib/current-user";

export default async function InquiriesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in?next=/inquiries");

  const inquiries = await getReceivedInquiries(currentUser.id);

  return (
    <>
      <Navbar />
      <main className="page-shell inbox-page">
        <p className="eyebrow">Owner inbox</p>
        <h1>Inquiries</h1>
        <p className="form-intro">Messages from people interested in your listings.</p>
        {inquiries.length === 0 ? (
          <p className="empty-state">No inquiries yet.</p>
        ) : (
          <div className="inquiry-list">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id}>
                <p className="eyebrow">{inquiry.listing.title}</p>
                <h2>{inquiry.sender.name}</h2>
                <p>{inquiry.message}</p>
                <a href={`mailto:${inquiry.sender.email}`}>Reply by email ↗</a>
                <Link href={`/listings/${inquiry.listing.id}`}>View listing</Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
