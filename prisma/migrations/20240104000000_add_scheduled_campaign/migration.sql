-- Add scheduled campaigns table
CREATE TABLE "ScheduledCampaign" (
    "id"          TEXT          NOT NULL,
    "subject"     TEXT          NOT NULL,
    "headline"    TEXT          NOT NULL,
    "bodyText"    TEXT,
    "ctaLabel"    TEXT          NOT NULL DEFAULT 'Shop Now',
    "ctaUrl"      TEXT          NOT NULL DEFAULT '/shop',
    "productIds"  JSONB         NOT NULL,
    "sendTo"      TEXT          NOT NULL DEFAULT 'all',
    "html"        TEXT          NOT NULL,
    "scheduledAt" TIMESTAMP(3)  NOT NULL,
    "status"      TEXT          NOT NULL DEFAULT 'PENDING',
    "sentCount"   INTEGER,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScheduledCampaign_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ScheduledCampaign_scheduledAt_idx" ON "ScheduledCampaign"("scheduledAt");
CREATE INDEX "ScheduledCampaign_status_idx"      ON "ScheduledCampaign"("status");
