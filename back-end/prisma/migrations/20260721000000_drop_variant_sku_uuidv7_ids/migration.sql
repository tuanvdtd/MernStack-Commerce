-- DropVariantSku: variant identity is UUID v7 id only (no sku code column).
ALTER TABLE `ProductVariant` DROP INDEX `ProductVariant_sku_key`;
ALTER TABLE `ProductVariant` DROP COLUMN `sku`;
