-- CreateTable
CREATE TABLE "JobStage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobStage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobStage" ADD CONSTRAINT "JobStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
