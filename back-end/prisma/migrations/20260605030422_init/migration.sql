/*
  Warnings:

  - Added the required column `brand` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `brand` VARCHAR(191) NOT NULL,
    ADD COLUMN `imgUrl` VARCHAR(191) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `ProductVariant` ADD COLUMN `imgUrl` VARCHAR(191) NULL;
