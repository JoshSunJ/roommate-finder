import { z } from "zod";

const dateInput = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const affiliationVerificationInputSchema = z
  .object({
    affiliationType: z.enum(["student", "intern"]),
    organizationId: z.number().int().positive().nullable(),
    organizationName: z.string().trim().max(120),
    affiliationEmail: z.string().trim().email().max(254),
    expectedEndDate: dateInput.nullable(),
  })
  .refine(
    (input) => input.organizationId !== null || input.organizationName.length >= 2,
    { message: "Enter your school or company.", path: ["organizationName"] },
  )
  .refine(
    (input) => input.affiliationType !== "intern" || input.expectedEndDate !== null,
    { message: "Interns must provide the expected internship end date.", path: ["expectedEndDate"] },
  );

export type AffiliationVerificationInput = z.infer<typeof affiliationVerificationInputSchema>;

export const verificationReviewSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  reviewerNote: z.string().trim().max(500).nullable(),
});
