import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/Navbar";
import { getConversationSummaries } from "@/features/conversations/service";
import { getCurrentUser } from "@/lib/current-user";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function InquiriesPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/sign-in?next=/inquiries");

  const conversations = await getConversationSummaries(currentUser.id);

  return (
    <>
      <Navbar />
      <main className="page-shell inbox-page">
        <p className="eyebrow">Private workspace</p>
        <h1>Inbox</h1>
        <p className="form-intro">Continue conversations without sharing personal contact details.</p>
        {conversations.length === 0 ? (
          <p className="empty-state">No conversations yet. Start one from a listing.</p>
        ) : (
          <div className="conversation-list">
            {conversations.map((conversation) => (
              <Link
                className={conversation.unreadCount > 0 ? "conversation-preview conversation-preview--unread" : "conversation-preview"}
                href={`/inquiries/${conversation.id}`}
                key={conversation.id}
              >
                <div className="conversation-preview__heading">
                  <div>
                    <p className="eyebrow">
                      {conversation.subject.kind === "listing" ? "Room listing" : "Housing request"}
                      {" · "}{conversation.subject.title}
                    </p>
                    <h2>{conversation.otherParticipant.name}</h2>
                  </div>
                  <time dateTime={conversation.updatedAt.toISOString()}>{dateFormatter.format(conversation.updatedAt)}</time>
                </div>
                <p><strong>{conversation.lastMessage.senderId === currentUser.id ? "You: " : ""}</strong>{conversation.lastMessage.body}</p>
                <div className="conversation-preview__footer">
                  <span>
                    {conversation.subject.status === "active"
                      ? `Active ${conversation.subject.kind === "listing" ? "listing" : "request"}`
                      : `${conversation.subject.kind === "listing" ? "Listing" : "Request"} ${conversation.subject.status}`}
                  </span>
                  {conversation.unreadCount > 0 && <span className="unread-badge">{conversation.unreadCount} new</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
