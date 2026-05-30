-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Backfill category for products that already exist.
INSERT INTO `Category` (`id`, `name`, `slug`, `description`, `createdAt`, `updatedAt`)
VALUES ('default-category', 'Uncategorized', 'uncategorized', 'Default category for existing products.', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3));

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `categoryId` VARCHAR(191) NULL;

UPDATE `Product` SET `categoryId` = 'default-category' WHERE `categoryId` IS NULL;

ALTER TABLE `Product` MODIFY `categoryId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Product_categoryId_idx` ON `Product`(`categoryId`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
