-- CreateEnum: GiftBoxSizeKey (replaces the standalone GiftBoxSize enum)
-- If GiftBoxSize already exists in the DB from a prior push, rename it.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GiftBoxSize') THEN
    ALTER TYPE "GiftBoxSize" RENAME TO "GiftBoxSizeKey";
  ELSE
    CREATE TYPE "GiftBoxSizeKey" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE');
  END IF;
END $$;

-- Update GiftCustomization.boxSize column type name if needed
-- (no data migration needed — values are identical)
ALTER TABLE "GiftCustomization"
  ALTER COLUMN "boxSize" TYPE "GiftBoxSizeKey"
  USING "boxSize"::text::"GiftBoxSizeKey";

-- CreateTable: GiftBoxSizeTier
CREATE TABLE "GiftBoxSizeTier" (
  "id"          TEXT NOT NULL,
  "key"         "GiftBoxSizeKey" NOT NULL,
  "label"       TEXT NOT NULL,
  "itemRange"   TEXT NOT NULL,
  "maxItems"    INTEGER NOT NULL,
  "price"       DOUBLE PRECISION NOT NULL,
  "description" TEXT NOT NULL,
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "sortOrder"   INTEGER NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GiftBoxSizeTier_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GiftBoxSizeTier_key_key" ON "GiftBoxSizeTier"("key");
CREATE INDEX "GiftBoxSizeTier_active_idx" ON "GiftBoxSizeTier"("active");
CREATE INDEX "GiftBoxSizeTier_sortOrder_idx" ON "GiftBoxSizeTier"("sortOrder");

-- Seed the 4 default tiers
INSERT INTO "GiftBoxSizeTier" ("id", "key", "label", "itemRange", "maxItems", "price", "description", "active", "sortOrder", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'SMALL',       'Small',       '1–5 items',    5,  8500,  'Perfect for a focused, intimate gift',             true, 0, NOW(), NOW()),
  (gen_random_uuid()::text, 'MEDIUM',      'Medium',      '5–10 items',   10, 10500, 'A generous selection for any occasion',            true, 1, NOW(), NOW()),
  (gen_random_uuid()::text, 'LARGE',       'Large',       '10–15 items',  15, 15000, 'A lavish collection that truly impresses',         true, 2, NOW(), NOW()),
  (gen_random_uuid()::text, 'EXTRA_LARGE', 'Extra Large', 'Up to 24 items', 24, 25000, 'The ultimate luxury gifting experience',         true, 3, NOW(), NOW());
