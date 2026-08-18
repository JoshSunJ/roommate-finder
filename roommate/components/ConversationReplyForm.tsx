"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConversationReplyForm({ conversationId }: { conversationId: number }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendMessage() {
    const trimmed = body.trim();
    if (!trimmed) return;

    setError("");
    setIsSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      if (!response.ok) {
        setError((await response.json()).error ?? "Could not send the message.");
        return;
      }
      setBody("");
      router.refresh();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="conversation-reply" aria-label="Reply to conversation">
      <label htmlFor="conversation-reply">Message</label>
      <textarea
        id="conversation-reply"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={1_000}
        rows={3}
        placeholder="Write a reply…"
      />
      <div>
        <span>{body.length} / 1,000</span>
        <button type="button" onClick={sendMessage} disabled={isSending || body.trim().length === 0}>
          {isSending ? "Sending…" : "Send message"}
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
