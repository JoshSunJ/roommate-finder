import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import VerificationReviewActions from "@/components/VerificationReviewActions";
import { getSubmittedVerifications } from "@/features/verification/service";
import { isAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/current-user";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function VerificationAdminPage() {
  const currentUser = await getCurrentUser();
  if (!isAdmin(currentUser)) redirect("/");
  const submissions = await getSubmittedVerifications();

  return (
    <>
      <Navbar />
      <main className="page-shell inbox-page">
        <p className="eyebrow">Administrator workspace</p>
        <h1>Verification reviews</h1>
        <p className="form-intro">
          Review only fallback submissions. Trusted organization-domain matches are confirmed through one-time email links automatically.
        </p>
        <div className="inquiry-list">
          {submissions.length === 0 ? (
            <p className="empty-state">No submissions are waiting for review.</p>
          ) : submissions.map((submission) => (
            <article key={submission.id}>
              <p className="eyebrow">Submitted {dateFormatter.format(submission.submittedAt)}</p>
              <h2>{submission.user.name}</h2>
              <p>Account: {submission.user.email}</p>
              <p>Claim: {submission.affiliationType} · {submission.organizationName}</p>
              <p>Affiliation email: {submission.affiliationEmail}</p>
              {submission.expectedEndDate && (
                <p>Expected end date: {dateFormatter.format(submission.expectedEndDate)}</p>
              )}
              <VerificationReviewActions verificationId={submission.id} />
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
