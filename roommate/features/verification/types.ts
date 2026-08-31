export type AffiliationType = "student" | "intern";

export type VerificationMethod = "institution_email" | "manual_review";

export type VerificationAttemptStatus =
  | "email_pending"
  | "pending_review"
  | "verified"
  | "rejected"
  | "expired";

export type OrganizationOption = {
  id: number;
  name: string;
  type: AffiliationType;
};

export type VerificationSnapshot = {
  id: number;
  affiliationType: AffiliationType;
  organizationName: string;
  maskedAffiliationEmail: string;
  method: VerificationMethod;
  status: VerificationAttemptStatus;
  reviewerNote: string | null;
  submittedAt: Date;
  verifiedAt: Date | null;
  expiresAt: Date | null;
};
