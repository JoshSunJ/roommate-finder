"use client";

import Link from "next/link";
import { useState } from "react";

type Result = {
  message?: string;
  error?: string;
  passwordResetPreviewUrl?: string;
};

export default function ForgotPasswordForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    setSubmitting(true);
    const response = await fetch("/api/auth/forgot-password", {
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
        {submitting ? "Sending…" : "Send reset link"}
      </button>
      {result?.error && <p className="form-error" role="alert">{result.error}</p>}
      {result?.message && <p className="auth-form__hint" role="status">{result.message}</p>}
      {result?.passwordResetPreviewUrl && (
        <p><Link href={result.passwordResetPreviewUrl}>Open local reset preview ↗</Link></p>
      )}
    </form>
  );
}
