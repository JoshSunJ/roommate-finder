-- A conversation may now concern either a listing or a housing request.
ALTER TABLE "Conversation" ALTER COLUMN "listingId" DROP NOT NULL;
ALTER TABLE "Conversation" ADD COLUMN "housingRequestId" INTEGER;

ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_housingRequestId_fkey"
FOREIGN KEY ("housingRequestId") REFERENCES "HousingRequest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Conversation_housingRequestId_idx"
ON "Conversation"("housingRequestId");

CREATE UNIQUE INDEX "Conversation_housingRequestId_seekerId_key"
ON "Conversation"("housingRequestId", "seekerId");

-- The database rejects conversations with no subject or two subjects.
ALTER TABLE "Conversation"
ADD CONSTRAINT "Conversation_exactly_one_subject_check"
CHECK (("listingId" IS NOT NULL)::integer + ("housingRequestId" IS NOT NULL)::integer = 1);

-- Preserve old lead responses by grouping each responder's messages into one
-- private conversation with the housing-request owner.
INSERT INTO "Conversation" (
  "housingRequestId",
  "ownerId",
  "seekerId",
  "createdAt",
  "updatedAt"
)
SELECT
  response."housingRequestId",
  request."ownerId",
  response."senderId",
  MIN(response."createdAt"),
  MAX(response."createdAt")
FROM "LeadResponse" AS response
JOIN "HousingRequest" AS request ON request."id" = response."housingRequestId"
GROUP BY response."housingRequestId", request."ownerId", response."senderId";

INSERT INTO "Message" ("conversationId", "senderId", "body", "createdAt")
SELECT
  conversation."id",
  response."senderId",
  response."message",
  response."createdAt"
FROM "LeadResponse" AS response
JOIN "Conversation" AS conversation
  ON conversation."housingRequestId" = response."housingRequestId"
 AND conversation."seekerId" = response."senderId"
ORDER BY response."createdAt";

-- Remove the legacy communication path only after all messages are copied.
DROP TABLE "LeadResponse";
