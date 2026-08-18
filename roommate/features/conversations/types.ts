export type ConversationParticipant = {
  id: number;
  name: string;
  affiliationType: string | null;
  affiliationName: string | null;
};

export type ConversationSummary = {
  id: number;
  listing: { id: number; title: string; status: string };
  otherParticipant: ConversationParticipant;
  lastMessage: { body: string; senderId: number; createdAt: Date };
  unreadCount: number;
  updatedAt: Date;
};

export type ConversationMessage = {
  id: number;
  body: string;
  senderId: number;
  senderName: string;
  readAt: Date | null;
  createdAt: Date;
};

export type ConversationDetail = {
  id: number;
  listing: { id: number; title: string; status: string };
  owner: ConversationParticipant;
  seeker: ConversationParticipant;
  messages: ConversationMessage[];
};
