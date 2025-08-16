-- CreateTable
CREATE TABLE "public"."Conversion" (
    "id" TEXT NOT NULL,
    "formId" TEXT,
    "eventId" TEXT,
    "responseToken" TEXT,
    "submittedAt" TIMESTAMP(3),
    "answersCount" INTEGER NOT NULL DEFAULT 0,
    "hidden" JSONB,
    "answers" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "actor" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_eventId_key" ON "public"."Conversion"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_responseToken_key" ON "public"."Conversion"("responseToken");

-- CreateIndex
CREATE INDEX "Conversion_deletedAt_idx" ON "public"."Conversion"("deletedAt");
