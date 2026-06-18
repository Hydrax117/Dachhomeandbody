-- AlterEnum: Replace perfumery-concentration enum with scent-family enum.
-- The fragranceType column is nullable and no rows use the old values,
-- so we can safely null it out, swap the enum, then restore the column.

-- Step 1: Clear any existing values (column is optional, no data loss)
UPDATE "Product" SET "fragranceType" = NULL WHERE "fragranceType" IS NOT NULL;

-- Step 2: Drop the column so we can drop the enum type
ALTER TABLE "Product" DROP COLUMN "fragranceType";

-- Step 3: Drop the old enum
DROP TYPE "FragranceType";

-- Step 4: Create the new scent-family enum
CREATE TYPE "FragranceType" AS ENUM ('FLORAL', 'WOODY', 'CITRUS', 'ORIENTAL', 'FRESH', 'FRUITY', 'EARTHY', 'GOURMAND');

-- Step 5: Re-add the column with the new enum type
ALTER TABLE "Product" ADD COLUMN "fragranceType" "FragranceType";
