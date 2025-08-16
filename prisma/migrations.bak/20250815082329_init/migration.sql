-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT,
    "eventId" TEXT,
    "responseToken" TEXT,
    "submittedAt" DATETIME,
    "answersCount" INTEGER NOT NULL DEFAULT 0,
    "hidden" JSONB,
    "answers" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_eventId_key" ON "Conversion"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversion_responseToken_key" ON "Conversion"("responseToken");
