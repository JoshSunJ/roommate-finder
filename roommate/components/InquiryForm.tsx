"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { listingId: number };

export default function InquiryForm({ listingId }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitInquiry() {
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message }),
      });

      if (!response.ok) {
        setError((await response.json()).error ?? "Could not start the conversation.");
        return;
      }

      const result = await response.json() as { conversationId: number };
      router.push(`/inquiries/${result.conversationId}`);
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="inquiry-form" aria-labelledby="contact-poster">
      <p className="eyebrow">Interested?</p>
      <h2 id="contact-poster">Contact the poster</h2>
      <p>Introduce yourself and mention what makes this home a good fit.</p>
      <label>
        Your message
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          minLength={10}
          maxLength={1_000}
          placeholder="Hi, I am interested in this room because…"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button type="button" onClick={submitInquiry} disabled={isSubmitting}>
        {isSubmitting ? "Opening conversation…" : "Start conversation"}
      </button>
    </section>
  );
}
