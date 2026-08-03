"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  listingId: number;
};

export default function DeleteListingButton({ listingId }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteListing() {
    setIsDeleting(true);
    setError("");

    const response = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setError("Could not delete this listing.");
      setIsDeleting(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="listing-management">
      <button
        className="delete-listing-button"
        type="button"
        onClick={deleteListing}
        disabled={isDeleting}
      >
        {isDeleting ? "Removing…" : "Remove listing"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
