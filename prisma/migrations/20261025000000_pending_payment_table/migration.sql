-- CreateTable: PendingPayment
-- Tracks an in-progress Paystack transaction so the same reference and
-- authorization URL are returned on repeat "Pay Now" clicks.
-- Rows expire after 30 minutes and are deleted when the order is confirmed.

CREATE TABLE "PendingPayment" (
    "id"               TEXT        NOT NULL,
    "reference"        TEXT        NOT NULL,
    "authorizationUrl" TEXT        NOT NULL,
    "email"            TEXT        NOT NULL,
    "amountKobo"       INTEGER     NOT NULL,
    "userId"           TEXT,
    "expiresAt"        TIMESTAMP(3) NOT NULL,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingPayment_pkey" PRIMARY KEY ("id")
);

-- Unique index on reference (one row per Paystack transaction)
CREATE UNIQUE INDEX "PendingPayment_reference_key" ON "PendingPayment"("reference");

-- Lookup indexes
CREATE INDEX "PendingPayment_email_idx"     ON "PendingPayment"("email");
CREATE INDEX "PendingPayment_userId_idx"    ON "PendingPayment"("userId");
CREATE INDEX "PendingPayment_expiresAt_idx" ON "PendingPayment"("expiresAt");
