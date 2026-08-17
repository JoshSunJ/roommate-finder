import prisma from "@/lib/prisma";
import type { CreateInquiryInput, ReceivedInquiry } from "./types";
import { isEitherUserBlocked } from "@/features/blocks/service";

export type CreateInquiryResult =
  | { kind: "created" }
  | { kind: "listing-not-found" }
  | { kind: "own-listing" }
  | { kind: "blocked" };

export async function createInquiry(
  input: CreateInquiryInput,
  senderId: number,
): Promise<CreateInquiryResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: { ownerId: true },
  });

  if (!listing) return { kind: "listing-not-found" };
  if (listing.ownerId === senderId) return { kind: "own-listing" };
  if (await isEitherUserBlocked(senderId, listing.ownerId)) return { kind: "blocked" };

  await prisma.inquiry.create({
    data: { listingId: input.listingId, senderId, message: input.message },
  });

  return { kind: "created" };
}

export async function getReceivedInquiries(ownerId: number): Promise<ReceivedInquiry[]> {
  return prisma.inquiry.findMany({
    where: { listing: { ownerId } },
    include: {
      listing: { select: { id: true, title: true } },
      sender: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
