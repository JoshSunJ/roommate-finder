"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("A route failed to render", { digest: error.digest });
  }, [error]);

  return (
    <main className="page-shell auth-page">
      <p className="eyebrow">Something went wrong</p>
      <h1>We could not load this page.</h1>
      <p className="form-intro">The error was recorded. You can safely try the request again.</p>
      <button className="button-link" type="button" onClick={reset}>Try again</button>
    </main>
  );
}
