-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "option" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rule" TEXT NOT NULL DEFAULT 'Optional',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
