import Link from "next/link";
import SignInForm from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <main className="page-shell auth-page">
      <Link href="/" className="back-link">← Back home</Link>
      <p className="eyebrow">Welcome back</p>
      <h1>Sign in</h1>
      <p className="form-intro">Access your listings and post a new home.</p>
      <SignInForm />
    </main>
  );
}
