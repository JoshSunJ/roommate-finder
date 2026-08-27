import type { Metadata } from "next";
import Link from "next/link";

import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password · Unitern" };

export default function ForgotPasswordPage() {
  return (
    <main className="page-shell auth-page">
      <Link href="/sign-in" className="back-link">← Back to sign in</Link>
      <p className="eyebrow">Account recovery</p>
      <h1>Reset your password.</h1>
      <p className="form-intro">We will send a single-use link that expires in one hour.</p>
      <ForgotPasswordForm />
    </main>
  );
}
