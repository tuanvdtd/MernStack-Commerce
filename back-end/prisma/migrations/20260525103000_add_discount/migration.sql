-- CreateTable
CREATE TABLE `Discount` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('fixed_amount', 'percentage') NOT NULL DEFAULT 'fixed_amount',
    `value` DECIMAL(12, 2) NOT NULL,
    `maxValue` DECIMAL(12, 2) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `maxUses` INTEGER NOT NULL,
    `usesCount` INTEGER NOT NULL DEFAULT 0,
    `maxUsesPerUser` INTEGER NOT NULL,
    `minOrderValue` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `appliesTo` ENUM('all', 'specific') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Discount_startDate_endDate_idx`(`startDate`, `endDate`),
    UNIQUE INDEX `Discount_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountProduct` (
    `discountId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,

    INDEX `DiscountProduct_productId_idx`(`productId`),
    PRIMARY KEY (`discountId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountUserUse` (
    `discountId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `usesCount` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DiscountUserUse_userId_idx`(`userId`),
    PRIMARY KEY (`discountId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DiscountProduct` ADD CONSTRAINT `DiscountProduct_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountProduct` ADD CONSTRAINT `DiscountProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountUserUse` ADD CONSTRAINT `DiscountUserUse_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountUserUse` ADD CONSTRAINT `DiscountUserUse_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
