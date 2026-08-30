import "dotenv/config";

import assert from "node:assert/strict";
import { after, test } from "node:test";

import {
  getConversationAndMarkRead,
  getConversationSummaries,
  startHousingRequestConversation,
} from "../../features/conversations/service";
import {
  deleteHousingRequestForOwner,
  getHousingRequestById,
  updateHousingRequestForOwner,
} from "../../features/housing-requests/service";
import prisma from "../../lib/prisma";

const runId = `${process.pid}-${Date.now()}`;
const emails = ["owner", "helper", "intruder"].map(
  (role) => `${role}-${runId}@integration.unitern.local`,
);
let requestId: number | undefined;

after(async () => {
  if (requestId) {
    await prisma.housingRequest.deleteMany({ where: { id: requestId } });
  }
  await prisma.user.deleteMany({ where: { email: { in: emails } } });
  await prisma.$disconnect();
});
test("a housing request can be managed only by its owner and contacted privately", async () => {
  const [owner, helper, intruder] = await Promise.all(
    emails.map((email, index) => prisma.user.create({
      data: {
        name: ["Request Owner", "Helpful Student", "Other User"][index],
        email,
        emailVerifiedAt: new Date(),
        verificationStatus: "approved",
      },
    })),
  );

  const housingRequest = await prisma.housingRequest.create({
    data: {
      ownerId: owner.id,
      title: "Need a summer room",
      maxRent: 1_500,
      preferredLocation: "Chicago, IL",
      description: "Seeking a practical room near transit for a summer internship.",
      moveInDate: "2026-06-01",
      moveOutDate: "2026-08-31",
      bedroomsNeeded: 1,
    },
  });
  requestId = housingRequest.id;

  assert.equal(await updateHousingRequestForOwner(
    housingRequest.id,
    intruder.id,
    {
      title: "Unauthorized change",
      maxRent: 2_000,
      preferredLocation: "New York, NY",
      description: "This update should never be written to the database.",
      moveInDate: "2026-06-01",
      moveOutDate: "2026-08-31",
      bedroomsNeeded: 1,
    },
  ), undefined);

  const updated = await updateHousingRequestForOwner(
    housingRequest.id,
    owner.id,
    {
      title: "Updated summer room search",
      maxRent: 1_650,
      preferredLocation: "Chicago, IL",
      description: "Seeking a furnished room near transit for a summer internship.",
      moveInDate: "2026-06-01",
      moveOutDate: "2026-08-31",
      bedroomsNeeded: 1,
    },
  );
  assert.equal(updated?.maxRent, 1_650);

  const started = await startHousingRequestConversation(
    { housingRequestId: housingRequest.id, message: "I know of a furnished room near the train." },
    helper.id,
  );
  assert.equal(started.kind, "created");
  if (started.kind !== "created") return;

  const ownerInbox = await getConversationSummaries(owner.id);
  assert.equal(ownerInbox.length, 1);
  assert.deepEqual(ownerInbox[0]?.subject, {
    kind: "housing_request",
    id: housingRequest.id,
    title: "Updated summer room search",
    status: "active",
  });

  const thread = await getConversationAndMarkRead(started.conversationId, owner.id);
  assert.equal(thread?.messages[0]?.body, "I know of a furnished room near the train.");
  assert.equal(thread?.messages[0]?.senderId, helper.id);

  assert.equal(await deleteHousingRequestForOwner(housingRequest.id, intruder.id), false);
  assert.equal(await deleteHousingRequestForOwner(housingRequest.id, owner.id), true);
  requestId = undefined;
  assert.equal(await getHousingRequestById(housingRequest.id), undefined);
  assert.equal(await prisma.conversation.findUnique({ where: { id: started.conversationId } }), null);
});
