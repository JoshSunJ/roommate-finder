"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificationReviewActions({ userId }: { userId: number }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function review(status: "verified" | "rejected") {
    setError("");
    setIsSaving(true);
    const response = await fetch(`/api/admin/verifications/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setError((await response.json()).error ?? "Could not save this review.");
      setIsSaving(false);
      return;
    }
    router.refresh();
  }

  return <div className="review-actions"><button type="button" disabled={isSaving} onClick={() => review("verified")}>Verify</button><button type="button" disabled={isSaving} onClick={() => review("rejected")}>Reject</button>{error && <p className="form-error">{error}</p>}</div>;
}
