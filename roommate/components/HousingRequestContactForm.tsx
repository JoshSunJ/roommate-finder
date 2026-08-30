"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HousingRequestContactForm({ housingRequestId }: { housingRequestId: number }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/requests/${housingRequestId}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: formData.get("message") }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Could not start the conversation.");
        return;
      }

      router.push(`/inquiries/${result.conversationId}`);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={submit} className="inquiry-form">
      <p className="eyebrow">Share a housing lead</p>
      <h2>Know of a relevant room?</h2>
      <p>Your message starts a private conversation without exposing either person&apos;s email.</p>
      <label>
        Message
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={1_000}
          placeholder="Describe the room, dates, price, and why it may fit."
        />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button disabled={isSubmitting}>
        {isSubmitting ? "Opening conversation…" : "Share lead privately"}
      </button>
    </form>
  );
}
