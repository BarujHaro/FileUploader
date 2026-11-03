/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "storage" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN     "storageKey" TEXT;

-- DropTable
DROP TABLE "Session";
