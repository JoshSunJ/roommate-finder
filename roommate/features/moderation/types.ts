export type ReportTargetType = "listing" | "housing_request";
export type ReportReason = "scam" | "harassment" | "incorrect" | "discrimination" | "other";
export type ReportDecision = "dismissed" | "actioned";

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  details?: string;
}
