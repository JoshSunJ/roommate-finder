"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { MAX_LISTING_PHOTOS } from "@/features/listing-photos/constants";
import type { ListingPhoto } from "@/features/listings/types";

type Props = { listingId: number; initialPhotos: ListingPhoto[] };

export default function ListingPhotoManager({ listingId, initialPhotos }: Props) {
  const router = useRouter();
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(formData: FormData) {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/listings/${listingId}/photos`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      setError((await response.json()).error ?? "Could not upload photos.");
      setBusy(false);
      return;
    }

    const created = await response.json() as ListingPhoto[];
    setPhotos((current) => [...current, ...created]);
    setBusy(false);
    router.refresh();
  }

  async function makeCover(photoId: number) {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/listings/${listingId}/photos/${photoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cover" }),
    });
    if (!response.ok) {
      setError((await response.json()).error ?? "Could not change the cover photo.");
      setBusy(false);
      return;
    }

    setPhotos((current) => {
      const selected = current.find((photo) => photo.id === photoId);
      if (!selected) return current;
      return [selected, ...current.filter((photo) => photo.id !== photoId)]
        .map((photo, position) => ({ ...photo, position }));
    });
    setBusy(false);
    router.refresh();
  }

  async function remove(photoId: number) {
    if (!window.confirm("Remove this photo from the listing?")) return;
    setBusy(true);
    setError("");
    const response = await fetch(`/api/listings/${listingId}/photos/${photoId}`, { method: "DELETE" });
    if (!response.ok) {
      setError((await response.json()).error ?? "Could not remove the photo.");
      setBusy(false);
      return;
    }

    setPhotos((current) => current
      .filter((photo) => photo.id !== photoId)
      .map((photo, position) => ({ ...photo, position })));
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="photo-manager" aria-labelledby="listing-photo-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Listing media</p>
          <h2 id="listing-photo-heading">Photos</h2>
        </div>
        <p className="result-count"><strong>{photos.length}</strong> / {MAX_LISTING_PHOTOS}</p>
      </div>

      {photos.length > 0 && (
        <div className="photo-manager__grid">
          {photos.map((photo, index) => (
            <article key={photo.id}>
              <div className="photo-manager__image">
                <Image src={photo.url} alt={photo.altText} fill sizes="(max-width: 600px) 100vw, 260px" />
                {index === 0 && <span>Cover</span>}
              </div>
              <div className="photo-manager__actions">
                {index !== 0 && <button type="button" disabled={busy} onClick={() => makeCover(photo.id)}>Make cover</button>}
                <button type="button" disabled={busy} onClick={() => remove(photo.id)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {photos.length < MAX_LISTING_PHOTOS && (
        <form action={upload} className="photo-upload-form">
          <label>Choose photos<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required /></label>
          <label>Photo description<input name="altText" maxLength={200} placeholder="Optional: Bright bedroom with desk and window" /></label>
          <p>JPEG, PNG, or WebP. Maximum 5 MB each. The first photo is the listing cover.</p>
          <button type="submit" disabled={busy}>{busy ? "Saving…" : "Upload photos"}</button>
        </form>
      )}
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
