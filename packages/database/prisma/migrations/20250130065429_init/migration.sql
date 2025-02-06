-- CreateTable
CREATE TABLE "JobPreview" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "JobPreview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobPreview" ADD CONSTRAINT "JobPreview_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobPreview" ADD CONSTRAINT "JobPreview_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
