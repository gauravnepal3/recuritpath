-- CreateTable
CREATE TABLE "JobMailingTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "JobMailingTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobMailingTemplate" ADD CONSTRAINT "JobMailingTemplate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
