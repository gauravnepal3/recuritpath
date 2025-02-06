-- DropForeignKey
ALTER TABLE "CandidateTimeline" DROP CONSTRAINT "CandidateTimeline_jobId_fkey";

-- AddForeignKey
ALTER TABLE "CandidateTimeline" ADD CONSTRAINT "CandidateTimeline_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
