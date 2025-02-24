-- DropForeignKey
ALTER TABLE "OrganizationUserRole" DROP CONSTRAINT "OrganizationUserRole_email_fkey";

-- AlterTable
ALTER TABLE "OrganizationUserRole" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "OrganizationUserRole" ADD CONSTRAINT "OrganizationUserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
