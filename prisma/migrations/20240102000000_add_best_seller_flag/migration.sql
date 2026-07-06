-- Add bestSeller flag to Product table
ALTER TABLE "Product" ADD COLUMN "bestSeller" BOOLEAN NOT NULL DEFAULT false;
