-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GENERAL';

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "type" SET DEFAULT 'GENERAL';
