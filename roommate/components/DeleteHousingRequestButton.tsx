"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteHousingRequestButton({ requestId }: { requestId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteRequest() {
    if (!window.confirm("Delete this housing request? This cannot be undone.")) return;

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(result?.error ?? "Could not delete this housing request.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="listing-management">
      <button
        className="delete-listing-button"
        type="button"
        onClick={deleteRequest}
        disabled={isDeleting}
      >
        {isDeleting ? "Removing…" : "Delete request"}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
