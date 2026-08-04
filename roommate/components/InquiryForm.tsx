"use client";

import { useState } from "react";

type Props = { listingId: number };

export default function InquiryForm({ listingId }: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function submitInquiry() {
    setError("");
    setIsSubmitting(true);
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, message }),
    });

    if (!response.ok) {
      setError((await response.json()).error ?? "Could not send your inquiry.");
      setIsSubmitting(false);
      return;
    }

    setIsSent(true);
    setMessage("");
    setIsSubmitting(false);
  }

  if (isSent) {
    return <p className="inquiry-success">Inquiry sent. The poster can now see it in their inbox.</p>;
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
        {isSubmitting ? "Sending…" : "Send inquiry"}
      </button>
    </section>
  );
}
