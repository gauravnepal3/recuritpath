/*
  Warnings:

  - Added the required column `organizationId` to the `JobPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "JobPost" ADD CONSTRAINT "JobPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
