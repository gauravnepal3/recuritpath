/*
  Warnings:

  - You are about to drop the column `userId` on the `OrganizationUserRole` table. All the data in the column will be lost.
  - Added the required column `email` to the `OrganizationUserRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrganizationUserRole" DROP CONSTRAINT "OrganizationUserRole_userId_fkey";

-- AlterTable
ALTER TABLE "OrganizationUserRole" DROP COLUMN "userId",
ADD COLUMN     "email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "OrganizationUserRole" ADD CONSTRAINT "OrganizationUserRole_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE NO ACTION ON UPDATE CASCADE;
