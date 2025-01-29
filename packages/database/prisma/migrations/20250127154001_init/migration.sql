-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
