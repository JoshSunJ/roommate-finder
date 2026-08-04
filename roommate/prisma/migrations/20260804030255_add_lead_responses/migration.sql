-- CreateTable
CREATE TABLE "LeadResponse" (
    "id" SERIAL NOT NULL,
    "housingRequestId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadResponse_housingRequestId_idx" ON "LeadResponse"("housingRequestId");

-- CreateIndex
CREATE INDEX "LeadResponse_senderId_idx" ON "LeadResponse"("senderId");

-- AddForeignKey
ALTER TABLE "LeadResponse" ADD CONSTRAINT "LeadResponse_housingRequestId_fkey" FOREIGN KEY ("housingRequestId") REFERENCES "HousingRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadResponse" ADD CONSTRAINT "LeadResponse_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
