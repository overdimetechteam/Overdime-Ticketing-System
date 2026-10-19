-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "affectedSystem" TEXT,
ADD COLUMN     "severity" "Severity";
