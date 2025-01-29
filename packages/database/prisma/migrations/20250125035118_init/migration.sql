/*
  Warnings:

  - You are about to drop the column `dispalyOrder` on the `JobStage` table. All the data in the column will be lost.
  - Added the required column `displayOrder` to the `JobStage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobStage" DROP COLUMN "dispalyOrder",
ADD COLUMN     "displayOrder" INTEGER NOT NULL;
