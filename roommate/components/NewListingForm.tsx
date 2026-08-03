"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ListingLocationPicker from "@/components/ListingLocationPicker";
import type { Coordinates } from "@/features/listings/types";

export default function NewListingForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] =
    useState<Coordinates | null>(null);

  async function handleSubmit(formData: FormData) {
    setError("");

    if (!selectedCoordinates) {
      setError("Select the listing location on the map before posting.");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        rent: Number(formData.get("rent")),
        location: formData.get("location"),
        description: formData.get("description"),
        bedrooms: Number(formData.get("bedrooms")),
        bathroomType: formData.get("bathroomType"),
        availableFrom: formData.get("availableFrom"),
        coordinates: selectedCoordinates,
      }),
    });

    if (!response.ok) {
      setError((await response.json()).error ?? "Could not create the listing.");
      setIsSubmitting(false);
      return;
    }

    const listing = await response.json();
    router.push(`/listings/${listing.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="new-listing-form">
      <label>Listing title<input name="title" required placeholder="Private room near SJSU" /></label>
      <label>Monthly rent<input name="rent" type="number" min="1" required /></label>
      <label>Location<input name="location" required placeholder="Downtown San Jose, CA" /></label>
      <div className="full-width location-picker-field">
        <div className="location-picker-heading">
          <p>Pin the listing on the map</p>
          <span>Click its approximate location to continue.</span>
        </div>
        <ListingLocationPicker
          value={selectedCoordinates}
          onChange={setSelectedCoordinates}
        />
        <p className="map-selection-status">
          {selectedCoordinates
            ? "Map point selected. Click elsewhere to move it."
            : "No map point selected yet."}
        </p>
      </div>
      <label>Bedrooms in the home<input name="bedrooms" type="number" min="1" required /></label>
      <label>Bathroom type<select name="bathroomType" defaultValue="Shared"><option>Shared</option><option>Private</option></select></label>
      <label>Available from<input name="availableFrom" required placeholder="August 1, 2026" /></label>
      <label className="full-width">Description<textarea name="description" required rows={4} /></label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create listing"}</button>
    </form>
  );
}
