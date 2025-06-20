-- DropForeignKey
ALTER TABLE "CandidateTimeline" DROP CONSTRAINT "CandidateTimeline_userId_fkey";

-- AlterTable
ALTER TABLE "CandidateTimeline" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CandidateTimeline" ADD CONSTRAINT "CandidateTimeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
