import Link from "next/link";
import SignUpForm from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="page-shell auth-page">
      <Link href="/" className="back-link">← Back home</Link>
      <p className="eyebrow">Start here</p>
      <h1>Create account</h1>
      <p className="form-intro">Create an account to post and manage your own listings.</p>
      <SignUpForm />
    </main>
  );
}
