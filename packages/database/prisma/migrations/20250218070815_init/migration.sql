/*
  Warnings:

  - Changed the type of `subscriptionType` on the `OrganizationSubscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OrganizationSubscription" DROP COLUMN "subscriptionType",
ADD COLUMN     "subscriptionType" TEXT NOT NULL;

-- DropEnum
DROP TYPE "SubscriptionType";
