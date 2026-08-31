"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VerificationReviewActions({ verificationId }: { verificationId: number }) {
  const router = useRouter();
  const [reviewerNote, setReviewerNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function review(status: "verified" | "rejected") {
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewerNote: reviewerNote.trim() || null,
        }),
      });
      if (!response.ok) {
        setError((await response.json()).error ?? "Could not save this review.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="review-actions">
      <label>
        Reviewer note
        <textarea
          value={reviewerNote}
          onChange={(event) => setReviewerNote(event.target.value)}
          maxLength={500}
          placeholder="Record the evidence checked or explain a rejection."
        />
      </label>
      <button type="button" disabled={isSaving} onClick={() => review("verified")}>Approve</button>
      <button type="button" disabled={isSaving} onClick={() => review("rejected")}>Reject</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
