-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "availableUntil" TEXT,
ADD COLUMN     "furnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leaseType" TEXT NOT NULL DEFAULT 'fixed_term',
ADD COLUMN     "parkingAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roomType" TEXT NOT NULL DEFAULT 'private',
ADD COLUMN     "securityDeposit" INTEGER,
ADD COLUMN     "utilitiesEstimate" INTEGER,
ADD COLUMN     "utilitiesIncluded" BOOLEAN NOT NULL DEFAULT false;
