"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModerationReviewActions({ reportId }: { reportId: number }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function review(decision: "dismissed" | "actioned") {
    setSaving(true); setError("");
    const response = await fetch(`/api/admin/reports/${reportId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, moderatorNote: note }) });
    if (!response.ok) { setError((await response.json()).error ?? "Could not review report."); setSaving(false); return; }
    router.refresh();
  }

  return <div className="moderation-review"><label>Moderator note<textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={1000} /></label><div><button disabled={saving} onClick={() => review("dismissed")}>Dismiss</button><button disabled={saving} onClick={() => review("actioned")}>Take action</button></div>{error && <p className="form-error">{error}</p>}</div>;
}
