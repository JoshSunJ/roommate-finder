"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { HousingRequestStatus } from "@/features/housing-requests/types";

type Props = {
  requestId: number;
  currentStatus: HousingRequestStatus;
};

export default function HousingRequestStatusControl({ requestId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveStatus() {
    setError("");
    setIsSaving(true);

    const response = await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setError((await response.json()).error ?? "Could not update this request.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="request-status-control">
      <label>
        Request status
        <select value={status} onChange={(event) => setStatus(event.target.value as HousingRequestStatus)}>
          <option value="active">Active — still looking</option>
          <option value="matched">Matched — a lead worked out</option>
          <option value="closed">Closed — no longer looking</option>
        </select>
      </label>
      <button type="button" onClick={saveStatus} disabled={isSaving || status === currentStatus}>
        {isSaving ? "Saving…" : "Save status"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
