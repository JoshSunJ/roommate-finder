-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Existing development records need an owner before this new relationship can
-- be required. A real production migration could map historical records by
-- their verified poster data instead.
INSERT INTO "User" ("name", "email")
VALUES ('Joshua', 'joshua@roommate-finder.local');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN "ownerId" INTEGER;

UPDATE "Listing"
SET "ownerId" = (
  SELECT "id" FROM "User" WHERE "email" = 'joshua@roommate-finder.local'
);

ALTER TABLE "Listing" ALTER COLUMN "ownerId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
