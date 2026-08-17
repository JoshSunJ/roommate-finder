import prisma from "@/lib/prisma";

export async function isEitherUserBlocked(firstUserId: number, secondUserId: number): Promise<boolean> {
  const block = await prisma.userBlock.findFirst({
    where: {
      OR: [
        { blockerId: firstUserId, blockedId: secondUserId },
        { blockerId: secondUserId, blockedId: firstUserId },
      ],
    },
    select: { id: true },
  });
  return Boolean(block);
}

export async function hasUserBlocked(blockerId: number, blockedId: number): Promise<boolean> {
  return Boolean(await prisma.userBlock.findUnique({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    select: { id: true },
  }));
}

export async function blockUser(blockerId: number, blockedId: number): Promise<boolean> {
  const blockedUserExists = Boolean(await prisma.user.findUnique({
    where: { id: blockedId },
    select: { id: true },
  }));
  if (!blockedUserExists) return false;

  await prisma.userBlock.upsert({
    where: { blockerId_blockedId: { blockerId, blockedId } },
    update: {},
    create: { blockerId, blockedId },
  });
  return true;
}

export async function unblockUser(blockerId: number, blockedId: number): Promise<void> {
  await prisma.userBlock.deleteMany({ where: { blockerId, blockedId } });
}
