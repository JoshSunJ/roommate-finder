"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="page-shell auth-page">
          <p className="eyebrow">Unitern is temporarily unavailable</p>
          <h1>We hit an unexpected problem.</h1>
          <p className="form-intro">Please retry. If the problem continues, the service may be recovering.</p>
          <button className="button-link" type="button" onClick={reset}>Retry Unitern</button>
        </main>
      </body>
    </html>
  );
}
