"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewHousingRequestForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        maxRent: Number(formData.get("maxRent")),
        preferredLocation: formData.get("preferredLocation"),
        description: formData.get("description"),
        moveInDate: formData.get("moveInDate"),
        moveOutDate: formData.get("moveOutDate"),
        bedroomsNeeded: Number(formData.get("bedroomsNeeded")),
      }),
    });

    if (!response.ok) {
      setError((await response.json()).error ?? "Could not post your request.");
      setIsSubmitting(false);
      return;
    }

    const housingRequest = await response.json();
    router.push(`/requests/${housingRequest.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="new-listing-form">
      <label>
        Request title
        <input name="title" required placeholder="Looking for a summer room near SJSU" />
      </label>
      <label>
        Maximum monthly rent
        <input name="maxRent" type="number" min="1" required />
      </label>
      <label>
        Preferred area
        <input name="preferredLocation" required placeholder="Downtown San Jose, CA" />
      </label>
      <label>
        Bedrooms needed
        <input name="bedroomsNeeded" type="number" min="1" max="10" defaultValue="1" required />
      </label>
      <label>
        Move-in date
        <input name="moveInDate" type="date" required />
      </label>
      <label>
        Move-out date
        <input name="moveOutDate" type="date" required />
      </label>
      <label className="full-width">
        Introduce your housing need
        <textarea
          name="description"
          required
          rows={5}
          minLength={20}
          placeholder="Share your dates, what kind of room you need, and practical details a potential roommate should know."
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Posting…" : "Post housing request"}
      </button>
    </form>
  );
}
