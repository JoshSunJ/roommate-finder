import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell auth-page">
      <p className="eyebrow">404</p>
      <h1>That page moved out.</h1>
      <p className="form-intro">The listing or page may have been removed, filled, or mistyped.</p>
      <Link className="button-link" href="/">Return home</Link>
    </main>
  );
}
