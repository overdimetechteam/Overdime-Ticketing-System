-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "department" TEXT,
ADD COLUMN     "hardwareIssue" TEXT,
ADD COLUMN     "ifOtherPleaseSpecify" TEXT,
ADD COLUMN     "networkIssue" TEXT,
ADD COLUMN     "problemCategory" TEXT,
ADD COLUMN     "remarks" TEXT,
ADD COLUMN     "softwareIssue" TEXT;
