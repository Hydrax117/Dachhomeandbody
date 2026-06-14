-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id"               TEXT NOT NULL,
    "token"            TEXT NOT NULL,
    "userId"           TEXT,
    "requesterEmail"   TEXT NOT NULL,
    "requesterName"    TEXT,
    "items"            JSONB NOT NULL,
    "shippingAddress"  JSONB NOT NULL,
    "subtotal"         DOUBLE PRECISION NOT NULL,
    "discount"         DOUBLE PRECISION NOT NULL DEFAULT 0,
    "shippingCost"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total"            DOUBLE PRECISION NOT NULL,
    "couponCode"       TEXT,
    "couponId"         TEXT,
    "status"           "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt"        TIMESTAMP(3) NOT NULL,
    "paymentReference" TEXT,
    "payerEmail"       TEXT,
    "orderId"          TEXT,
    "paidAt"           TIMESTAMP(3),
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_token_key" ON "PaymentRequest"("token");

-- CreateIndex
CREATE INDEX "PaymentRequest_token_idx"    ON "PaymentRequest"("token");
CREATE INDEX "PaymentRequest_userId_idx"   ON "PaymentRequest"("userId");
CREATE INDEX "PaymentRequest_status_idx"   ON "PaymentRequest"("status");
CREATE INDEX "PaymentRequest_createdAt_idx" ON "PaymentRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
