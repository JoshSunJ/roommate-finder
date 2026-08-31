-- Preserve the fast current-verification projection on User while adding
-- normalized attempts, trusted organizations, one-time tokens, and review history.
ALTER TABLE "User"
ADD COLUMN "affiliationVerificationMethod" TEXT,
ADD COLUMN "affiliationVerifiedAt" TIMESTAMP(3),
ADD COLUMN "affiliationExpiresAt" TIMESTAMP(3);

CREATE TABLE "Organization" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrganizationDomain" (
  "id" SERIAL NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "domain" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrganizationDomain_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AffiliationVerification" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "organizationId" INTEGER,
  "reviewerId" INTEGER,
  "affiliationType" TEXT NOT NULL,
  "claimedOrganizationName" TEXT NOT NULL,
  "affiliationEmail" TEXT NOT NULL,
  "expectedEndDate" TIMESTAMP(3),
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "providerReference" TEXT,
  "reviewerNote" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verifiedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AffiliationVerification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AffiliationVerificationToken" (
  "id" TEXT NOT NULL,
  "verificationId" INTEGER NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliationVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Organization_name_type_key" ON "Organization"("name", "type");
CREATE INDEX "Organization_type_active_idx" ON "Organization"("type", "active");
CREATE UNIQUE INDEX "OrganizationDomain_domain_key" ON "OrganizationDomain"("domain");
CREATE INDEX "OrganizationDomain_organizationId_idx" ON "OrganizationDomain"("organizationId");
CREATE INDEX "AffiliationVerification_userId_createdAt_idx" ON "AffiliationVerification"("userId", "createdAt");
CREATE INDEX "AffiliationVerification_status_submittedAt_idx" ON "AffiliationVerification"("status", "submittedAt");
CREATE INDEX "AffiliationVerification_organizationId_idx" ON "AffiliationVerification"("organizationId");
CREATE INDEX "AffiliationVerification_reviewerId_idx" ON "AffiliationVerification"("reviewerId");
CREATE UNIQUE INDEX "AffiliationVerificationToken_verificationId_key" ON "AffiliationVerificationToken"("verificationId");
CREATE UNIQUE INDEX "AffiliationVerificationToken_tokenHash_key" ON "AffiliationVerificationToken"("tokenHash");
CREATE INDEX "AffiliationVerificationToken_expiresAt_idx" ON "AffiliationVerificationToken"("expiresAt");

ALTER TABLE "OrganizationDomain"
ADD CONSTRAINT "OrganizationDomain_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AffiliationVerification"
ADD CONSTRAINT "AffiliationVerification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AffiliationVerification"
ADD CONSTRAINT "AffiliationVerification_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AffiliationVerification"
ADD CONSTRAINT "AffiliationVerification_reviewerId_fkey"
FOREIGN KEY ("reviewerId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AffiliationVerificationToken"
ADD CONSTRAINT "AffiliationVerificationToken_verificationId_fkey"
FOREIGN KEY ("verificationId") REFERENCES "AffiliationVerification"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- A small trusted-domain catalog makes the first release useful while keeping
-- domain trust in data rather than hard-coded application conditionals.
INSERT INTO "Organization" ("name", "type", "updatedAt") VALUES
  ('San José State University', 'student', CURRENT_TIMESTAMP),
  ('Stanford University', 'student', CURRENT_TIMESTAMP),
  ('University of California, Berkeley', 'student', CURRENT_TIMESTAMP),
  ('University of California, Los Angeles', 'student', CURRENT_TIMESTAMP),
  ('Google', 'intern', CURRENT_TIMESTAMP),
  ('PayPal', 'intern', CURRENT_TIMESTAMP),
  ('Apple', 'intern', CURRENT_TIMESTAMP),
  ('Microsoft', 'intern', CURRENT_TIMESTAMP);

INSERT INTO "OrganizationDomain" ("organizationId", "domain") VALUES
  ((SELECT "id" FROM "Organization" WHERE "name" = 'San José State University' AND "type" = 'student'), 'sjsu.edu'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'Stanford University' AND "type" = 'student'), 'stanford.edu'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'University of California, Berkeley' AND "type" = 'student'), 'berkeley.edu'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'University of California, Los Angeles' AND "type" = 'student'), 'ucla.edu'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'Google' AND "type" = 'intern'), 'google.com'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'PayPal' AND "type" = 'intern'), 'paypal.com'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'Apple' AND "type" = 'intern'), 'apple.com'),
  ((SELECT "id" FROM "Organization" WHERE "name" = 'Microsoft' AND "type" = 'intern'), 'microsoft.com');

-- Backfill legacy reviewed declarations into the new audit history. Existing
-- verified users receive a one-year renewal window instead of permanent trust.
INSERT INTO "AffiliationVerification" (
  "userId",
  "affiliationType",
  "claimedOrganizationName",
  "affiliationEmail",
  "method",
  "status",
  "submittedAt",
  "verifiedAt",
  "expiresAt",
  "reviewedAt",
  "createdAt",
  "updatedAt"
)
SELECT
  "id",
  COALESCE("affiliationType", 'student'),
  COALESCE("affiliationName", 'Legacy affiliation'),
  "email",
  'manual_review',
  CASE
    WHEN "verificationStatus" = 'verified' THEN 'verified'
    WHEN "verificationStatus" = 'submitted' THEN 'pending_review'
    WHEN "verificationStatus" = 'rejected' THEN 'rejected'
    ELSE 'expired'
  END,
  COALESCE("verificationSubmittedAt", "createdAt"),
  CASE WHEN "verificationStatus" = 'verified' THEN CURRENT_TIMESTAMP ELSE NULL END,
  CASE WHEN "verificationStatus" = 'verified' THEN CURRENT_TIMESTAMP + INTERVAL '1 year' ELSE NULL END,
  CASE WHEN "verificationStatus" IN ('verified', 'rejected') THEN CURRENT_TIMESTAMP ELSE NULL END,
  COALESCE("verificationSubmittedAt", "createdAt"),
  CURRENT_TIMESTAMP
FROM "User"
WHERE "affiliationType" IS NOT NULL OR "affiliationName" IS NOT NULL;

UPDATE "User"
SET
  "affiliationVerificationMethod" = 'manual_review',
  "affiliationVerifiedAt" = CURRENT_TIMESTAMP,
  "affiliationExpiresAt" = CURRENT_TIMESTAMP + INTERVAL '1 year'
WHERE "verificationStatus" = 'verified';
