-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "seekerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Conversation_ownerId_updatedAt_idx" ON "Conversation"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "Conversation_seekerId_updatedAt_idx" ON "Conversation"("seekerId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_listingId_seekerId_key" ON "Conversation"("listingId", "seekerId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Preserve every existing inquiry by grouping messages between the same seeker
-- and listing into one conversation. The listing owner is captured as the
-- other participant so authorization does not depend on client input.
INSERT INTO "Conversation" ("listingId", "ownerId", "seekerId", "createdAt", "updatedAt")
SELECT
    inquiry."listingId",
    listing."ownerId",
    inquiry."senderId",
    MIN(inquiry."createdAt"),
    MAX(inquiry."createdAt")
FROM "Inquiry" AS inquiry
JOIN "Listing" AS listing ON listing."id" = inquiry."listingId"
GROUP BY inquiry."listingId", listing."ownerId", inquiry."senderId";

-- Convert the original inquiry text into the first messages of each thread.
INSERT INTO "Message" ("conversationId", "senderId", "body", "createdAt")
SELECT
    conversation."id",
    inquiry."senderId",
    inquiry."message",
    inquiry."createdAt"
FROM "Inquiry" AS inquiry
JOIN "Conversation" AS conversation
  ON conversation."listingId" = inquiry."listingId"
 AND conversation."seekerId" = inquiry."senderId"
ORDER BY inquiry."createdAt";

-- Remove the legacy table only after its records exist in the new model.
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_listingId_fkey";
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_senderId_fkey";
DROP TABLE "Inquiry";
