"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Could not reset your password.");
      setSubmitting(false);
      return;
    }

    router.replace("/sign-in?reset=1");
    router.refresh();
  }

  return (
    <form action={submit} className="auth-form">
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>
      <label>Confirm password<input name="passwordConfirmation" type="password" autoComplete="new-password" minLength={8} maxLength={128} required /></label>
      <p className="auth-form__hint">Use between 8 and 128 characters.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? "Changing…" : "Change password"}</button>
    </form>
  );
}
