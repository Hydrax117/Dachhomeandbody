-- Migration: Add ProductVariant and variantId columns
-- Run this in Supabase SQL Editor → New query → paste → Run

-- 1. Create the ProductVariant table
CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id"             TEXT NOT NULL,
    "productId"      TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "sku"            TEXT NOT NULL,
    "price"          DOUBLE PRECISION NOT NULL,
    "compareAtPrice" DOUBLE PRECISION,
    "stock"          INTEGER NOT NULL DEFAULT 0,
    "sortOrder"      INTEGER NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_sku_key"       ON "ProductVariant"("sku");
CREATE        INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE        INDEX IF NOT EXISTS "ProductVariant_sku_idx"       ON "ProductVariant"("sku");

ALTER TABLE "ProductVariant"
    ADD CONSTRAINT "ProductVariant_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 2. Add variantId + variantName to OrderItem
ALTER TABLE "OrderItem"
    ADD COLUMN IF NOT EXISTS "variantId"   TEXT,
    ADD COLUMN IF NOT EXISTS "variantName" TEXT;

CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId");

ALTER TABLE "OrderItem"
    DROP CONSTRAINT IF EXISTS "OrderItem_variantId_fkey";
ALTER TABLE "OrderItem"
    ADD CONSTRAINT "OrderItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. Add variantId to WishlistItem (and update unique constraint)
ALTER TABLE "WishlistItem"
    ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- Drop old unique constraint, add new one that includes variantId
ALTER TABLE "WishlistItem"
    DROP CONSTRAINT IF EXISTS "WishlistItem_userId_productId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_productId_variantId_key"
    ON "WishlistItem"("userId", "productId", "variantId");

CREATE INDEX IF NOT EXISTS "WishlistItem_variantId_idx" ON "WishlistItem"("variantId");

ALTER TABLE "WishlistItem"
    DROP CONSTRAINT IF EXISTS "WishlistItem_variantId_fkey";
ALTER TABLE "WishlistItem"
    ADD CONSTRAINT "WishlistItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 4. Add variantId to CartItem (and update unique constraint)
ALTER TABLE "CartItem"
    ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- Drop old unique constraint, add new one that includes variantId
ALTER TABLE "CartItem"
    DROP CONSTRAINT IF EXISTS "CartItem_userId_productId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_productId_variantId_key"
    ON "CartItem"("userId", "productId", "variantId");

CREATE INDEX IF NOT EXISTS "CartItem_variantId_idx" ON "CartItem"("variantId");

ALTER TABLE "CartItem"
    DROP CONSTRAINT IF EXISTS "CartItem_variantId_fkey";
ALTER TABLE "CartItem"
    ADD CONSTRAINT "CartItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. Add variantId to StockHistory
ALTER TABLE "StockHistory"
    ADD COLUMN IF NOT EXISTS "variantId" TEXT;

CREATE INDEX IF NOT EXISTS "StockHistory_variantId_idx" ON "StockHistory"("variantId");

ALTER TABLE "StockHistory"
    DROP CONSTRAINT IF EXISTS "StockHistory_variantId_fkey";
ALTER TABLE "StockHistory"
    ADD CONSTRAINT "StockHistory_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 6. Add variantId + variantName to GiftOrderItem
ALTER TABLE "GiftOrderItem"
    ADD COLUMN IF NOT EXISTS "variantId"   TEXT,
    ADD COLUMN IF NOT EXISTS "variantName" TEXT;

CREATE INDEX IF NOT EXISTS "GiftOrderItem_variantId_idx" ON "GiftOrderItem"("variantId");

ALTER TABLE "GiftOrderItem"
    DROP CONSTRAINT IF EXISTS "GiftOrderItem_variantId_fkey";
ALTER TABLE "GiftOrderItem"
    ADD CONSTRAINT "GiftOrderItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
