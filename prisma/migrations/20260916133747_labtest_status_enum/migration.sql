/*
  Warnings:

  - The `status` column on the `LabTest` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LabTestStatus" AS ENUM ('PENDING', 'READY');

-- AlterTable
ALTER TABLE "LabTest" DROP COLUMN "status",
ADD COLUMN     "status" "LabTestStatus" NOT NULL DEFAULT 'PENDING';
