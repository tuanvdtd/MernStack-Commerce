-- Chuyển toàn bộ PK/FK Int sang VARCHAR(36) cho UUID v7.
-- Dữ liệu user/role/otp cũ sẽ bị xóa — chạy lại `npm run seed` sau migrate.

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM `CartItem`;
DELETE FROM `Cart`;
DELETE FROM `ProductReview`;
DELETE FROM `DiscountUserUse`;
DELETE FROM `Address`;
DELETE FROM `User`;
DELETE FROM `Role`;
DELETE FROM `Otp`;

ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_cartId_fkey`;
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_variantId_fkey`;
ALTER TABLE `Cart` DROP FOREIGN KEY `Cart_userId_fkey`;
ALTER TABLE `ProductReview` DROP FOREIGN KEY `ProductReview_userId_fkey`;
ALTER TABLE `ProductReview` DROP FOREIGN KEY `ProductReview_productId_fkey`;
ALTER TABLE `DiscountUserUse` DROP FOREIGN KEY `DiscountUserUse_userId_fkey`;
ALTER TABLE `DiscountUserUse` DROP FOREIGN KEY `DiscountUserUse_discountId_fkey`;
ALTER TABLE `Address` DROP FOREIGN KEY `Address_userId_fkey`;
ALTER TABLE `User` DROP FOREIGN KEY `User_roleId_fkey`;

ALTER TABLE `Role`
  MODIFY `id` VARCHAR(36) NOT NULL;

ALTER TABLE `User`
  MODIFY `id` VARCHAR(36) NOT NULL,
  MODIFY `roleId` VARCHAR(36) NOT NULL;

ALTER TABLE `Address`
  MODIFY `id` VARCHAR(36) NOT NULL,
  MODIFY `userId` VARCHAR(36) NOT NULL;

ALTER TABLE `Otp`
  MODIFY `id` VARCHAR(36) NOT NULL;

ALTER TABLE `Cart`
  MODIFY `userId` VARCHAR(36) NOT NULL;

ALTER TABLE `ProductReview`
  MODIFY `userId` VARCHAR(36) NOT NULL;

ALTER TABLE `DiscountUserUse`
  MODIFY `userId` VARCHAR(36) NOT NULL;

ALTER TABLE `User`
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Address`
  ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Cart`
  ADD CONSTRAINT `Cart_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CartItem`
  ADD CONSTRAINT `CartItem_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `ProductReview`
  ADD CONSTRAINT `ProductReview_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductReview_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `DiscountUserUse`
  ADD CONSTRAINT `DiscountUserUse_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `DiscountUserUse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS = 1;
