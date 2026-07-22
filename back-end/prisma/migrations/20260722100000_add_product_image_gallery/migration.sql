-- CreateTable
CREATE TABLE `ProductImage` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `publicId` VARCHAR(255) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `alt` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProductImage_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill gallery from legacy Product.imgUrl (one row per product)
INSERT INTO `ProductImage` (`id`, `productId`, `url`, `publicId`, `sortOrder`, `createdAt`)
SELECT
    UUID(),
    p.`id`,
    p.`imgUrl`,
    CASE
        WHEN p.`imgUrl` LIKE '%cloudinary%' THEN CONCAT('flashbuy/products/', p.`id`, '/spu')
        ELSE NULL
    END,
    0,
    NOW(3)
FROM `Product` p
WHERE p.`imgUrl` IS NOT NULL AND TRIM(p.`imgUrl`) <> '';
