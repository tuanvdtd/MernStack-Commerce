-- Rename denormalized cover cache to explicit thumbnail semantics
ALTER TABLE `Product` CHANGE COLUMN `imgUrl` `thumbnail` VARCHAR(191) NULL;
