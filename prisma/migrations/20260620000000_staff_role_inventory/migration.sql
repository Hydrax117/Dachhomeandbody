-- Migration: Staff role, inventory sync, and in-store sales
-- Generated: 2026-06-20

-- ── 1. Add STAFF to UserRole enum ─────────────────────────────────────────
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';

-- ── 2. Add StockChannel enum ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "StockChannel" AS ENUM (
    'ONLINE_ORDER',
    'IN_STORE_SALE',
    'MANUAL_ADJUSTMENT',
    'RESTOCK',
    'CANCELLATION',
    'REFUND'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 3. Add InStorePayment enum ────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "InStorePayment" AS ENUM ('CASH', 'POS', 'TRANSFER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 4. Add channel column to StockHistory ─────────────────────────────────
ALTER TABLE "StockHistory"
  ADD COLUMN IF NOT EXISTS "channel" "StockChannel" NOT NULL DEFAULT 'MANUAL_ADJUSTMENT';

-- ── 5. Create InStoreSale table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "InStoreSale" (
  "id"            TEXT         NOT NULL,
  "saleNumber"    TEXT         NOT NULL,
  "staffId"       TEXT,
  "customerName"  TEXT,
  "items"         JSONB        NOT NULL,
  "subtotal"      DOUBLE PRECISION NOT NULL,
  "total"         DOUBLE PRECISION NOT NULL,
  "paymentMethod" "InStorePayment" NOT NULL DEFAULT 'CASH',
  "notes"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InStoreSale_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on saleNumber
CREATE UNIQUE INDEX IF NOT EXISTS "InStoreSale_saleNumber_key"
  ON "InStoreSale"("saleNumber");

-- Indexes
CREATE INDEX IF NOT EXISTS "InStoreSale_staffId_idx"
  ON "InStoreSale"("staffId");
CREATE INDEX IF NOT EXISTS "InStoreSale_createdAt_idx"
  ON "InStoreSale"("createdAt");

-- FK: InStoreSale.staffId → User.id
DO $$ BEGIN
  ALTER TABLE "InStoreSale"
    ADD CONSTRAINT "InStoreSale_staffId_fkey"
    FOREIGN KEY ("staffId")
    REFERENCES "User"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── 6. Add inStoreSaleId column to StockHistory ───────────────────────────
ALTER TABLE "StockHistory"
  ADD COLUMN IF NOT EXISTS "inStoreSaleId" TEXT;

-- FK: StockHistory.inStoreSaleId → InStoreSale.id
DO $$ BEGIN
  ALTER TABLE "StockHistory"
    ADD CONSTRAINT "StockHistory_inStoreSaleId_fkey"
    FOREIGN KEY ("inStoreSaleId")
    REFERENCES "InStoreSale"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Index on channel for reporting queries
CREATE INDEX IF NOT EXISTS "StockHistory_channel_idx"
  ON "StockHistory"("channel");
