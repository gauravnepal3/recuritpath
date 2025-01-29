/*
  Warnings:

  - Added the required column `dispalyOrder` to the `JobStage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobStage" ADD COLUMN     "dispalyOrder" INTEGER NOT NULL,
ADD COLUMN     "isDeletable" BOOLEAN NOT NULL DEFAULT false;
