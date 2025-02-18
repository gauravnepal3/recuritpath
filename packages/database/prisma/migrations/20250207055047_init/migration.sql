-- AlterTable
ALTER TABLE "CandidateTimeline" ADD COLUMN     "reviewId" TEXT;

-- CreateTable
CREATE TABLE "CandidateReview" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "verdict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateReview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CandidateTimeline" ADD CONSTRAINT "CandidateTimeline_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "CandidateReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;
