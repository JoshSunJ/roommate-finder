-- AlterTable
ALTER TABLE "User" ADD COLUMN     "affiliationName" TEXT,
ADD COLUMN     "affiliationType" TEXT,
ADD COLUMN     "verificationStatus" TEXT NOT NULL DEFAULT 'unverified',
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);
