"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import type { SavedItemTargetType } from "@/features/saved-items/types";

type Props = {
  targetType: SavedItemTargetType;
  targetId: number;
  initialSaved: boolean;
  signedIn: boolean;
};

export default function SaveItemButton({ targetType, targetId, initialSaved, signedIn }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggleSaved() {
    if (!signedIn) {
      router.push(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    setIsBusy(true);
    setError("");
    try {
      const response = await fetch("/api/saved-items", {
        method: nextSaved ? "PUT" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (!response.ok) {
        setIsSaved(!nextSaved);
        setError((await response.json()).error ?? "Could not update saved housing.");
        return;
      }
      router.refresh();
    } catch {
      setIsSaved(!nextSaved);
      setError("Could not reach the server.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="save-item-control">
      <button
        type="button"
        className={isSaved ? "save-item-button save-item-button--saved" : "save-item-button"}
        aria-pressed={isSaved}
        aria-label={isSaved ? "Remove from saved housing" : "Save for later"}
        onClick={toggleSaved}
        disabled={isBusy}
      >
        <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span> {isSaved ? "Saved" : "Save"}
      </button>
      {error && <span className="save-item-error" role="status">{error}</span>}
    </div>
  );
}
