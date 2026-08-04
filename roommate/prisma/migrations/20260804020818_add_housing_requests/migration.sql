-- CreateTable
CREATE TABLE "HousingRequest" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "maxRent" INTEGER NOT NULL,
    "preferredLocation" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "moveInDate" TEXT NOT NULL,
    "moveOutDate" TEXT NOT NULL,
    "bedroomsNeeded" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HousingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HousingRequest_ownerId_idx" ON "HousingRequest"("ownerId");

-- CreateIndex
CREATE INDEX "HousingRequest_preferredLocation_idx" ON "HousingRequest"("preferredLocation");

-- CreateIndex
CREATE INDEX "HousingRequest_maxRent_idx" ON "HousingRequest"("maxRent");

-- AddForeignKey
ALTER TABLE "HousingRequest" ADD CONSTRAINT "HousingRequest_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
