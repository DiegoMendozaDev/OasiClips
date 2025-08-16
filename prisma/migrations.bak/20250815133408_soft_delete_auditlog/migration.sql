-- AlterTable
ALTER TABLE "Conversion" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Conversion" ADD COLUMN "deletedBy" TEXT;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "actor" TEXT,
    "meta" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Conversion_deletedAt_idx" ON "Conversion"("deletedAt");
