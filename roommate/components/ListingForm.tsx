"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import ListingLocationPicker from "@/components/ListingLocationPicker";
import type { Coordinates, Listing } from "@/features/listings/types";

type Props =
  | { mode: "create"; listing?: never }
  | { mode: "edit"; listing: Listing };

const steps = ["The space", "Price & dates", "Location", "Review"];

function nullableNumber(formData: FormData, name: string): number | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() ? Number(value) : null;
}

export default function ListingForm({ mode, listing }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(
    listing?.coordinates ?? null,
  );

  function goToNextStep() {
    setError("");
    const panel = formRef.current?.querySelector<HTMLElement>(`[data-form-step="${step}"]`);
    const fields = panel?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea");

    if (fields) {
      for (const field of fields) {
        if (!field.reportValidity()) return;
      }
    }

    if (step === 2 && !selectedCoordinates) {
      setError("Select the approximate location before reviewing your listing.");
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(formData: FormData) {
    setError("");

    if (!selectedCoordinates) {
      setStep(2);
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
    <form ref={formRef} action={handleSubmit} className="new-listing-form listing-flow">
      <ol className="form-progress" aria-label="Listing progress">
        {steps.map((label, index) => (
          <li key={label} className={index === step ? "is-active" : index < step ? "is-complete" : ""}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      <section className="form-step" data-form-step="0" hidden={step !== 0}>
        <div className="form-step__heading"><p className="eyebrow">Step 01</p><h2>Describe the space.</h2><span>Start with what someone needs to understand at a glance.</span></div>
        <label>Listing title<input name="title" required minLength={5} maxLength={100} defaultValue={listing?.title} placeholder="Private room near SJSU" /></label>
        <label>Room type<select name="roomType" defaultValue={listing?.roomType ?? "private"}><option value="private">Private room</option><option value="shared">Shared room</option><option value="entire_place">Entire place</option></select></label>
        <label>Bedrooms in the home<input name="bedrooms" type="number" min="1" max="20" required defaultValue={listing?.bedrooms} /></label>
        <label>Bathroom type<select name="bathroomType" defaultValue={listing?.bathroomType ?? "Shared"}><option>Shared</option><option>Private</option></select></label>
        <label className="full-width">Description<textarea name="description" required minLength={10} maxLength={3000} rows={6} defaultValue={listing?.description} placeholder="Describe the room, household, and what would help a student or intern decide." /></label>
      </section>

      <section className="form-step" data-form-step="1" hidden={step !== 1}>
        <div className="form-step__heading"><p className="eyebrow">Step 02</p><h2>Set clear terms.</h2><span>Transparent costs and dates make a listing easier to trust.</span></div>
        <label>Monthly rent<input name="rent" type="number" min="1" max="50000" required defaultValue={listing?.rent} /></label>
        <label>Lease type<select name="leaseType" defaultValue={listing?.leaseType ?? "fixed_term"}><option value="sublet">Sublet</option><option value="month_to_month">Month to month</option><option value="fixed_term">Fixed term</option></select></label>
        <label>Security deposit<input name="securityDeposit" type="number" min="0" max="100000" defaultValue={listing?.securityDeposit ?? ""} placeholder="Optional" /></label>
        <label>Estimated monthly utilities<input name="utilitiesEstimate" type="number" min="0" max="10000" defaultValue={listing?.utilitiesEstimate ?? ""} placeholder="Optional" /></label>
        <label>Available from<input name="availableFrom" required defaultValue={listing?.availableFrom} placeholder="2026-08-01" /></label>
        <label>Available until<input name="availableUntil" defaultValue={listing?.availableUntil ?? ""} placeholder="Optional, e.g. 2026-08-31" /></label>
      </section>

      <section className="form-step" data-form-step="2" hidden={step !== 2}>
        <div className="form-step__heading"><p className="eyebrow">Step 03</p><h2>Place it on the map.</h2><span>Use a public neighborhood label and an approximate pin—not a private unit number.</span></div>
        <label className="full-width">Public location<input name="location" required maxLength={120} defaultValue={listing?.location} placeholder="Downtown San Jose, CA" /></label>
        <div className="full-width location-picker-field">
          <ListingLocationPicker value={selectedCoordinates} onChange={setSelectedCoordinates} />
          <p className="map-selection-status">
            {selectedCoordinates ? "Approximate map point selected." : "No map point selected yet."}
          </p>
        </div>
      </section>

      <section className="form-step" data-form-step="3" hidden={step !== 3}>
        <div className="form-step__heading"><p className="eyebrow">Step 04</p><h2>Add practical details.</h2><span>These small facts often decide whether a home is actually workable.</span></div>
        <fieldset className="full-width listing-options">
          <legend>Included and allowed</legend>
          <label><input name="furnished" type="checkbox" defaultChecked={listing?.furnished} /> Furnished</label>
          <label><input name="utilitiesIncluded" type="checkbox" defaultChecked={listing?.utilitiesIncluded} /> Utilities included</label>
          <label><input name="parkingAvailable" type="checkbox" defaultChecked={listing?.parkingAvailable} /> Parking available</label>
          <label><input name="petsAllowed" type="checkbox" defaultChecked={listing?.petsAllowed} /> Pets allowed</label>
        </fieldset>
        <div className="listing-review-note full-width">
          <strong>Ready for review</strong>
          <p>After saving, you can upload and arrange photos from the listing’s edit page.</p>
        </div>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-navigation">
        {step > 0 && <button type="button" className="form-back" onClick={() => setStep((current) => current - 1)}>← Back</button>}
        {step < steps.length - 1 ? (
          <button type="button" onClick={goToNextStep}>Continue →</button>
        ) : (
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : mode === "create" ? "Create listing ↗" : "Save changes ↗"}
          </button>
        )}
      </div>
    </form>
  );
}
