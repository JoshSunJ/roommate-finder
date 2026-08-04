import prisma from "@/lib/prisma";
export async function createLeadResponse(housingRequestId: number, senderId: number, message: string) {
  const request = await prisma.housingRequest.findUnique({ where: { id: housingRequestId }, select: { ownerId: true } });
  if (!request) return "not-found" as const;
  if (request.ownerId === senderId) return "own-request" as const;
  return prisma.leadResponse.create({ data: { housingRequestId, senderId, message } });
}
export async function getLeadResponsesForRequest(housingRequestId: number) {
  return prisma.leadResponse.findMany({ where: { housingRequestId }, include: { sender: true }, orderBy: { createdAt: "desc" } });
}
