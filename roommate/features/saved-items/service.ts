import type { SavedItemIds, SavedItemTarget } from "@/features/saved-items/types";
import prisma from "@/lib/prisma";

export type SaveItemResult = "saved" | "not-found";

export async function saveItem(userId: number, target: SavedItemTarget): Promise<SaveItemResult> {
  if (target.targetType === "listing") {
    const exists = await prisma.listing.findUnique({ where: { id: target.targetId }, select: { id: true } });
    if (!exists) return "not-found";
    await prisma.savedListing.upsert({
      where: { userId_listingId: { userId, listingId: target.targetId } },
      update: {},
      create: { userId, listingId: target.targetId },
    });
    return "saved";
  }

  const exists = await prisma.housingRequest.findUnique({ where: { id: target.targetId }, select: { id: true } });
  if (!exists) return "not-found";
  await prisma.savedHousingRequest.upsert({
    where: { userId_housingRequestId: { userId, housingRequestId: target.targetId } },
    update: {},
    create: { userId, housingRequestId: target.targetId },
  });
  return "saved";
}

export async function unsaveItem(userId: number, target: SavedItemTarget): Promise<void> {
  if (target.targetType === "listing") {
    await prisma.savedListing.deleteMany({ where: { userId, listingId: target.targetId } });
    return;
  }
  await prisma.savedHousingRequest.deleteMany({
    where: { userId, housingRequestId: target.targetId },
  });
}

export async function getSavedItemIds(userId: number): Promise<SavedItemIds> {
  const [listings, housingRequests] = await Promise.all([
    prisma.savedListing.findMany({
      where: { userId },
      select: { listingId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedHousingRequest.findMany({
      where: { userId },
      select: { housingRequestId: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    listingIds: listings.map((item) => item.listingId),
    housingRequestIds: housingRequests.map((item) => item.housingRequestId),
  };
}

export async function isItemSaved(userId: number, target: SavedItemTarget): Promise<boolean> {
  if (target.targetType === "listing") {
    return Boolean(await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId, listingId: target.targetId } },
      select: { userId: true },
    }));
  }
  return Boolean(await prisma.savedHousingRequest.findUnique({
    where: { userId_housingRequestId: { userId, housingRequestId: target.targetId } },
    select: { userId: true },
  }));
}
