import type { Metadata } from "next";
import Link from "next/link";

import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password · Unitern",
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token = "" } = await searchParams;

  return (
    <main className="page-shell auth-page">
      <Link href="/sign-in" className="back-link">← Back to sign in</Link>
      <p className="eyebrow">Account recovery</p>
      <h1>Choose a new password.</h1>
      {token.length >= 32 ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="form-error" role="alert">This reset link is incomplete or invalid.</p>
      )}
    </main>
  );
}
