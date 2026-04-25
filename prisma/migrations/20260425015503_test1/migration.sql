-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'SELECTED', 'EMITTED');

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "uso" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "coverage" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "selectedCarrier" TEXT,
    "selectedPremium" DOUBLE PRECISION,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientRfc" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quote_createdAt_idx" ON "Quote"("createdAt");

-- CreateIndex
CREATE INDEX "Quote_status_idx" ON "Quote"("status");
