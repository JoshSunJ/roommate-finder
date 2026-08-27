import Link from "next/link";
import SignInForm from "@/components/SignInForm";

type Props = { searchParams: Promise<{ reset?: string }> };

export default async function SignInPage({ searchParams }: Props) {
  const { reset } = await searchParams;

  return (
    <main className="page-shell auth-page">
      <Link href="/" className="back-link">← Back home</Link>
      <p className="eyebrow">Welcome back</p>
      <h1>Sign in</h1>
      <p className="form-intro">
        {reset ? "Password changed. Sign in with your new password." : "Access your listings and post a new home."}
      </p>
      <SignInForm />
    </main>
  );
}
