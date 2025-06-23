/*
  Warnings:

  - You are about to drop the column `uploaded_at` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Document` DROP COLUMN `uploaded_at`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
