-- AlterEnum
-- Adds the ADMIN organization role. The application has always offered ADMIN in
-- the invite UI and checked for it in every role guard, but the enum only held
-- OWNER and INTERVIEWER, so inviting an Admin failed at the database layer.
ALTER TYPE "OrganizationRole" ADD VALUE IF NOT EXISTS 'ADMIN';
