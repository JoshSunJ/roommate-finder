"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReportTargetType } from "@/features/moderation/types";

type Props = { targetType: ReportTargetType; targetId: number; ownerId: number; initiallyBlocked: boolean };

export default function SafetyActions({ targetType, targetId, ownerId, initiallyBlocked }: Props) {
  const router = useRouter();
  const [showReport, setShowReport] = useState(false);
  const [isBlocked, setIsBlocked] = useState(initiallyBlocked);
  const [message, setMessage] = useState("");

  async function toggleBlock() {
    const response = await fetch("/api/blocks", {
      method: isBlocked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedUserId: ownerId }),
    });
    if (!response.ok) { setMessage("Could not update this block."); return; }
    setIsBlocked(!isBlocked);
    setMessage(isBlocked ? "User unblocked." : "User blocked. Contact is disabled in both directions.");
    router.refresh();
  }

  async function report(formData: FormData) {
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason: formData.get("reason"), details: formData.get("details") }),
    });
    if (!response.ok) { setMessage((await response.json()).error ?? "Could not submit report."); return; }
    setMessage("Report submitted for administrator review.");
    setShowReport(false);
  }

  return <section className="safety-actions" aria-label="Safety actions">
    <div><button type="button" onClick={() => setShowReport(!showReport)}>Report</button><button type="button" onClick={toggleBlock}>{isBlocked ? "Unblock user" : "Block user"}</button></div>
    {showReport && <form action={report}><label>Reason<select name="reason" defaultValue="scam"><option value="scam">Possible scam</option><option value="harassment">Harassment</option><option value="incorrect">Incorrect information</option><option value="discrimination">Discriminatory content</option><option value="other">Other</option></select></label><label>Details<textarea name="details" maxLength={1000} rows={4} placeholder="Give the moderator enough context to investigate." /></label><button type="submit">Submit report</button></form>}
    {message && <p>{message}</p>}
  </section>;
}
