"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { HousingRequest } from "@/features/housing-requests/types";

type Props =
  | { mode: "create"; housingRequest?: never }
  | { mode: "edit"; housingRequest: HousingRequest };

export default function HousingRequestForm({ mode, housingRequest }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        mode === "create" ? "/api/requests" : `/api/requests/${housingRequest.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
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
        },
      );

      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not save your housing request.");
        return;
      }

      router.push(`/requests/${result.id}`);
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="new-listing-form">
      <label>
        Request title
        <input
          name="title"
          required
          minLength={5}
          maxLength={120}
          defaultValue={housingRequest?.title}
          placeholder="Looking for a summer room near SJSU"
        />
      </label>
      <label>
        Maximum monthly rent
        <input
          name="maxRent"
          type="number"
          min="1"
          max="100000"
          required
          defaultValue={housingRequest?.maxRent}
        />
      </label>
      <label>
        Preferred area
        <input
          name="preferredLocation"
          required
          minLength={2}
          maxLength={120}
          defaultValue={housingRequest?.preferredLocation}
          placeholder="Downtown San Jose, CA"
        />
      </label>
      <label>
        Bedrooms needed
        <input
          name="bedroomsNeeded"
          type="number"
          min="1"
          max="10"
          defaultValue={housingRequest?.bedroomsNeeded ?? 1}
          required
        />
      </label>
      <label>
        Move-in date
        <input name="moveInDate" type="date" required defaultValue={housingRequest?.moveInDate} />
      </label>
      <label>
        Move-out date
        <input name="moveOutDate" type="date" required defaultValue={housingRequest?.moveOutDate} />
      </label>
      <label className="full-width">
        Introduce your housing need
        <textarea
          name="description"
          required
          rows={5}
          minLength={20}
          maxLength={2_000}
          defaultValue={housingRequest?.description}
          placeholder="Share your dates, what kind of room you need, and practical details a potential roommate should know."
        />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving…"
          : mode === "create"
            ? "Post housing request"
            : "Save changes"}
      </button>
    </form>
  );
}
