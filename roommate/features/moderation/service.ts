import prisma from "@/lib/prisma";
import type { CreateReportInput, ReportDecision } from "./types";

async function targetExists(input: Pick<CreateReportInput, "targetType" | "targetId">) {
  if (input.targetType === "listing") {
    return Boolean(await prisma.listing.findUnique({ where: { id: input.targetId }, select: { id: true } }));
  }
  return Boolean(await prisma.housingRequest.findUnique({ where: { id: input.targetId }, select: { id: true } }));
}

export async function createReport(input: CreateReportInput, reporterId: number) {
  if (!await targetExists(input)) return null;
  return prisma.report.create({ data: { ...input, reporterId } });
}

export async function getModerationReports() {
  return prisma.report.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function reviewReport(reportId: number, reviewerId: number, decision: ReportDecision, moderatorNote?: string) {
  return prisma.$transaction(async (transaction) => {
    const report = await transaction.report.findFirst({ where: { id: reportId, status: "pending" } });
    if (!report) return false;

    if (decision === "actioned") {
      if (report.targetType === "listing") {
        await transaction.listing.updateMany({ where: { id: report.targetId }, data: { status: "expired" } });
      } else if (report.targetType === "housing_request") {
        await transaction.housingRequest.updateMany({ where: { id: report.targetId }, data: { status: "closed" } });
      }
    }

    await transaction.report.update({
      where: { id: report.id },
      data: { status: decision, reviewerId, moderatorNote, reviewedAt: new Date() },
    });
    return true;
  });
}
