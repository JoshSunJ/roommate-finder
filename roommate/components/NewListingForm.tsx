"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError("");
    const response = await fetch("/api/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      title: formData.get("title"), rent: Number(formData.get("rent")), location: formData.get("location"), description: formData.get("description"), bedrooms: Number(formData.get("bedrooms")), bathroomType: formData.get("bathroomType"), availableFrom: formData.get("availableFrom"), postedBy: formData.get("postedBy"),
      coordinates: { latitude: Number(formData.get("latitude")), longitude: Number(formData.get("longitude")) },
    }) });
    if (!response.ok) { setError((await response.json()).error ?? "Could not create the listing."); setIsSubmitting(false); return; }
    const listing = await response.json();
    router.push(`/listings/${listing.id}`);
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="new-listing-form">
      <label>Listing title<input name="title" required placeholder="Private room near SJSU" /></label>
      <label>Monthly rent<input name="rent" type="number" min="1" required /></label>
      <label>Location<input name="location" required placeholder="Downtown San Jose, CA" /></label>
      <label>Bedrooms in the home<input name="bedrooms" type="number" min="1" required /></label>
      <label>Bathroom type<select name="bathroomType" defaultValue="Shared"><option>Shared</option><option>Private</option></select></label>
      <label>Available from<input name="availableFrom" required placeholder="August 1, 2026" /></label>
      <label>Posted by<input name="postedBy" required placeholder="Your name" /></label>
      <label>Latitude (temporary map pin)<input name="latitude" type="number" step="any" required defaultValue="37.3352" /></label>
      <label>Longitude (temporary map pin)<input name="longitude" type="number" step="any" required defaultValue="-121.8811" /></label>
      <label className="full-width">Description<textarea name="description" required rows={4} /></label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create listing"}</button>
    </form>
  );
}
