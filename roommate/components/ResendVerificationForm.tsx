"use client";

import Link from "next/link";
import { useState } from "react";

type Result = { message: string; verificationPreviewUrl?: string };

export default function ResendVerificationForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setSubmitting(true);
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email") }),
    });
    setResult(await response.json());
    setSubmitting(false);
  }

  return (
    <form action={submit} className="auth-form">
      <label>Email<input type="email" name="email" autoComplete="email" required /></label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send another link"}
      </button>
      {result && <p className="auth-form__hint" role="status">{result.message}</p>}
      {result?.verificationPreviewUrl && (
        <p><Link href={result.verificationPreviewUrl}>Open local verification preview ↗</Link></p>
      )}
    </form>
  );
}
