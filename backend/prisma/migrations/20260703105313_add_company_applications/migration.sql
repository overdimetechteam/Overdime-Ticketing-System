-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "application" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "applications" TEXT[],
ADD COLUMN     "company" TEXT;
