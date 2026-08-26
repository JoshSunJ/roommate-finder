"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email, password, or verification status is incorrect.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="auth-form">
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</button>
      <p>New here? <Link href="/sign-up">Create an account</Link>.</p>
      <p>Need another link? <Link href="/verify-email">Verify your email</Link>.</p>
    </form>
  );
}
