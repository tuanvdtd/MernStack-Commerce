/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,variantId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `variantId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_cartId_fkey`;

-- DropForeignKey
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropIndex
DROP INDEX `CartItem_cartId_productId_key` ON `CartItem`;

-- DropIndex
DROP INDEX `CartItem_productId_idx` ON `CartItem`;

-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `productId`,
    ADD COLUMN `variantId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `CartItem_variantId_idx` ON `CartItem`(`variantId`);

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_cartId_variantId_key` ON `CartItem`(`cartId`, `variantId`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
