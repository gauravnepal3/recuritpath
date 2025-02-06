-- CreateTable
CREATE TABLE "CandidateTimeline" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "timelineText" TEXT NOT NULL,
    "comment" TEXT,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "CandidateTimeline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CandidateTimeline" ADD CONSTRAINT "CandidateTimeline_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTimeline" ADD CONSTRAINT "CandidateTimeline_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTimeline" ADD CONSTRAINT "CandidateTimeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
