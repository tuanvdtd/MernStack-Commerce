-- DropForeignKey
ALTER TABLE `Address` DROP FOREIGN KEY `Address_userId_fkey`;

-- AlterTable
ALTER TABLE `Address`
    DROP COLUMN `city`,
    DROP COLUMN `street`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `detail` VARCHAR(191) NOT NULL,
    ADD COLUMN `isDefault` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `label` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NOT NULL,
    ADD COLUMN `provinceCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `provinceName` VARCHAR(191) NOT NULL,
    ADD COLUMN `recipientName` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `wardCode` VARCHAR(191) NOT NULL,
    ADD COLUMN `wardName` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `CartItem` ADD COLUMN `selected` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `recipientName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `provinceName` VARCHAR(191) NOT NULL,
    `wardName` VARCHAR(191) NOT NULL,
    `addressDetail` VARCHAR(191) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `shippingFee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discountAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discountCode` VARCHAR(191) NULL,
    `total` DECIMAL(12, 2) NOT NULL,
    `orderStatus` ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `paymentMethod` ENUM('cod', 'online') NOT NULL,
    `paymentStatus` ENUM('unpaid', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'unpaid',
    `shipmentStatus` ENUM('not_shipped', 'shipped', 'delivered', 'returned') NOT NULL DEFAULT 'not_shipped',
    `note` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_orderNumber_key`(`orderNumber`),
    INDEX `Order_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `Order_orderStatus_idx`(`orderStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `variantLabel` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    INDEX `OrderItem_variantId_idx`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Province` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ward` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `provinceCode` VARCHAR(191) NOT NULL,

    INDEX `Ward_provinceCode_idx`(`provinceCode`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `ProductVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ward` ADD CONSTRAINT `Ward_provinceCode_fkey` FOREIGN KEY (`provinceCode`) REFERENCES `Province`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Address` RENAME INDEX `Address_userId_fkey` TO `Address_userId_idx`;
