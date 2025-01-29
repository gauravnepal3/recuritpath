-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN     "category" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "countryListResidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "countryResidence" TEXT DEFAULT 'No',
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "displaySalary" TEXT DEFAULT 'Not Shown',
ADD COLUMN     "employmentType" TEXT,
ADD COLUMN     "maximumAmount" DOUBLE PRECISION,
ADD COLUMN     "minimumAmount" DOUBLE PRECISION,
ADD COLUMN     "remoteOption" TEXT,
ADD COLUMN     "salaryAmount" DOUBLE PRECISION;
