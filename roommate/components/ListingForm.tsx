"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ListingLocationPicker from "@/components/ListingLocationPicker";
import type { Coordinates, Listing } from "@/features/listings/types";

type Props =
  | { mode: "create"; listing?: never }
  | { mode: "edit"; listing: Listing };

function nullableNumber(formData: FormData, name: string): number | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? Number(value) : null;
}

export default function ListingForm({ mode, listing }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(
    listing?.coordinates ?? null,
  );

  async function handleSubmit(formData: FormData) {
    setError("");

    if (!selectedCoordinates) {
      setError("Select the listing location on the map before saving.");
      return;
    }

    setIsSubmitting(true);

    const availableUntil = formData.get("availableUntil");
    const listingInput = {
      title: formData.get("title"),
      rent: Number(formData.get("rent")),
      location: formData.get("location"),
      description: formData.get("description"),
      bedrooms: Number(formData.get("bedrooms")),
      bathroomType: formData.get("bathroomType"),
      availableFrom: formData.get("availableFrom"),
      availableUntil:
        typeof availableUntil === "string" && availableUntil.trim()
          ? availableUntil
          : null,
      roomType: formData.get("roomType"),
      leaseType: formData.get("leaseType"),
      furnished: formData.get("furnished") === "on",
      utilitiesIncluded: formData.get("utilitiesIncluded") === "on",
      utilitiesEstimate: nullableNumber(formData, "utilitiesEstimate"),
      securityDeposit: nullableNumber(formData, "securityDeposit"),
      parkingAvailable: formData.get("parkingAvailable") === "on",
      petsAllowed: formData.get("petsAllowed") === "on",
      coordinates: selectedCoordinates,
    };

    const response = await fetch(
      mode === "create" ? "/api/listings" : `/api/listings/${listing.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "create"
            ? listingInput
            : { action: "details", listing: listingInput },
        ),
      },
    );

    if (!response.ok) {
      setError((await response.json()).error ?? "Could not save the listing.");
      setIsSubmitting(false);
      return;
    }

    const savedListing = await response.json();
    router.push(`/listings/${savedListing.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="new-listing-form">
      <label>Listing title<input name="title" required minLength={5} maxLength={100} defaultValue={listing?.title} placeholder="Private room near SJSU" /></label>
      <label>Monthly rent<input name="rent" type="number" min="1" max="50000" required defaultValue={listing?.rent} /></label>
      <label>Public location<input name="location" required maxLength={120} defaultValue={listing?.location} placeholder="Downtown San Jose, CA" /></label>
      <label>Room type<select name="roomType" defaultValue={listing?.roomType ?? "private"}><option value="private">Private room</option><option value="shared">Shared room</option><option value="entire_place">Entire place</option></select></label>
      <div className="full-width location-picker-field">
        <div className="location-picker-heading">
          <p>Pin the approximate location</p>
          <span>Do not expose a private unit number or exact bedroom location.</span>
        </div>
        <ListingLocationPicker value={selectedCoordinates} onChange={setSelectedCoordinates} />
        <p className="map-selection-status">
          {selectedCoordinates
            ? "Map point selected. Click elsewhere to move it."
            : "No map point selected yet."}
        </p>
      </div>
      <label>Bedrooms in the home<input name="bedrooms" type="number" min="1" max="20" required defaultValue={listing?.bedrooms} /></label>
      <label>Bathroom type<select name="bathroomType" defaultValue={listing?.bathroomType ?? "Shared"}><option>Shared</option><option>Private</option></select></label>
      <label>Lease type<select name="leaseType" defaultValue={listing?.leaseType ?? "fixed_term"}><option value="sublet">Sublet</option><option value="month_to_month">Month to month</option><option value="fixed_term">Fixed term</option></select></label>
      <label>Security deposit<input name="securityDeposit" type="number" min="0" max="100000" defaultValue={listing?.securityDeposit ?? ""} placeholder="Optional" /></label>
      <label>Available from<input name="availableFrom" required defaultValue={listing?.availableFrom} placeholder="2026-08-01" /></label>
      <label>Available until<input name="availableUntil" defaultValue={listing?.availableUntil ?? ""} placeholder="Optional, e.g. 2026-08-31" /></label>
      <label>Estimated monthly utilities<input name="utilitiesEstimate" type="number" min="0" max="10000" defaultValue={listing?.utilitiesEstimate ?? ""} placeholder="Optional" /></label>
      <fieldset className="full-width listing-options">
        <legend>Practical details</legend>
        <label><input name="furnished" type="checkbox" defaultChecked={listing?.furnished} /> Furnished</label>
        <label><input name="utilitiesIncluded" type="checkbox" defaultChecked={listing?.utilitiesIncluded} /> Utilities included</label>
        <label><input name="parkingAvailable" type="checkbox" defaultChecked={listing?.parkingAvailable} /> Parking available</label>
        <label><input name="petsAllowed" type="checkbox" defaultChecked={listing?.petsAllowed} /> Pets allowed</label>
      </fieldset>
      <label className="full-width">Description<textarea name="description" required minLength={10} maxLength={3000} rows={5} defaultValue={listing?.description} /></label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
      </button>
    </form>
  );
}
