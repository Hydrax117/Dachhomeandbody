-- Add GiftRibbonStyle and GiftRibbonColor enums, and ribbonStyle/ribbonColor
-- columns to GiftCustomization. This migration was applied directly to the
-- database and is recorded here to keep local migrations in sync.

CREATE TYPE "GiftRibbonStyle" AS ENUM ('SATIN', 'GROSGRAIN', 'VELVET');
CREATE TYPE "GiftRibbonColor" AS ENUM ('BLACK', 'GOLD', 'ROSE_PINK');

ALTER TABLE "GiftCustomization"
  ADD COLUMN IF NOT EXISTS "ribbonStyle" "GiftRibbonStyle" NOT NULL DEFAULT 'SATIN',
  ADD COLUMN IF NOT EXISTS "ribbonColor" "GiftRibbonColor" NOT NULL DEFAULT 'BLACK';
