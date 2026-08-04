import prisma from "@/lib/prisma";
import type { CurrentUser } from "@/lib/current-user";

export async function submitVerification(user: CurrentUser, input: { affiliationType: "student" | "intern"; affiliationName: string }) {
  return prisma.user.update({ where: { id: user.id }, data: { ...input, verificationStatus: "submitted", verificationSubmittedAt: new Date() } });
}

export async function getSubmittedVerifications() {
  return prisma.user.findMany({ where: { verificationStatus: "submitted" }, orderBy: { verificationSubmittedAt: "asc" } });
}

export async function reviewVerification(userId: number, status: "verified" | "rejected") {
  const result = await prisma.user.updateMany({ where: { id: userId, verificationStatus: "submitted" }, data: { verificationStatus: status } });
  return result.count === 1;
}
