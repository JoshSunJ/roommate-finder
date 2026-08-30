import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import ConversationReplyForm from "@/components/ConversationReplyForm";
import Navbar from "@/components/Navbar";
import { getConversationAndMarkRead } from "@/features/conversations/service";
import { getCurrentUser } from "@/lib/current-user";

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

type PageProps = { params: Promise<{ id: string }> };

export default async function ConversationPage({ params }: PageProps) {
  const currentUser = await getCurrentUser();
  const { id } = await params;
  if (!currentUser) redirect(`/sign-in?next=/inquiries/${id}`);

  const conversationId = Number(id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) notFound();
  const conversation = await getConversationAndMarkRead(conversationId, currentUser.id);
  if (!conversation) notFound();

  const otherParticipant = conversation.owner.id === currentUser.id
    ? conversation.seeker
    : conversation.owner;

  return (
    <>
      <Navbar />
      <main className="page-shell conversation-page">
        <Link href="/inquiries" className="back-link">← Inbox</Link>
        <header className="conversation-header">
          <div>
            <p className="eyebrow">Conversation with {otherParticipant.name}</p>
            <h1>{conversation.subject.title}</h1>
            <p>{otherParticipant.affiliationName
              ? `${otherParticipant.affiliationType ?? "Member"} · ${otherParticipant.affiliationName}`
              : "Verified community member"}</p>
          </div>
          <Link href={conversation.subject.kind === "listing"
            ? `/listings/${conversation.subject.id}`
            : `/requests/${conversation.subject.id}`}>
            View {conversation.subject.kind === "listing" ? "listing" : "request"} ↗
          </Link>
        </header>

        <section className="message-thread" aria-label={`Messages with ${otherParticipant.name}`}>
          {conversation.messages.map((message) => {
            const isOwn = message.senderId === currentUser.id;
            return (
              <article className={isOwn ? "message-bubble message-bubble--own" : "message-bubble"} key={message.id}>
                <p>{message.body}</p>
                <footer>
                  <span>{isOwn ? "You" : message.senderName}</span>
                  <time dateTime={message.createdAt.toISOString()}>{timeFormatter.format(message.createdAt)}</time>
                </footer>
              </article>
            );
          })}
        </section>
        <ConversationReplyForm conversationId={conversation.id} />
      </main>
    </>
  );
}
