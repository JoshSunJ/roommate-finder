-- CreateTable
CREATE TABLE "SavedListing" (
    "userId" INTEGER NOT NULL,
    "listingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedListing_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "SavedHousingRequest" (
    "userId" INTEGER NOT NULL,
    "housingRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedHousingRequest_pkey" PRIMARY KEY ("userId","housingRequestId")
);

-- CreateIndex
CREATE INDEX "SavedListing_userId_createdAt_idx" ON "SavedListing"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedHousingRequest_userId_createdAt_idx" ON "SavedHousingRequest"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedHousingRequest" ADD CONSTRAINT "SavedHousingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedHousingRequest" ADD CONSTRAINT "SavedHousingRequest_housingRequestId_fkey" FOREIGN KEY ("housingRequestId") REFERENCES "HousingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
