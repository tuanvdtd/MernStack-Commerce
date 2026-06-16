-- DropForeignKey
ALTER TABLE `_RoleToUser` DROP FOREIGN KEY `_RoleToUser_A_fkey`;

-- DropForeignKey
ALTER TABLE `_RoleToUser` DROP FOREIGN KEY `_RoleToUser_B_fkey`;

-- Ensure a fallback role exists before backfilling existing users.
INSERT INTO `Role` (`name`)
VALUES ('USER')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- AlterTable
ALTER TABLE `User` ADD COLUMN `roleId` INTEGER NULL;

-- Preserve an existing role from the old many-to-many table.
-- If a user had multiple roles, ADMIN wins over USER; otherwise fall back to USER.
UPDATE `User` u
LEFT JOIN (
    SELECT
        ru.`B` AS `userId`,
        COALESCE(
            MAX(CASE WHEN r.`name` = 'ADMIN' THEN r.`id` END),
            MAX(CASE WHEN r.`name` = 'USER' THEN r.`id` END),
            MIN(r.`id`)
        ) AS `roleId`
    FROM `_RoleToUser` ru
    INNER JOIN `Role` r ON r.`id` = ru.`A`
    GROUP BY ru.`B`
) picked ON picked.`userId` = u.`id`
SET u.`roleId` = COALESCE(
    picked.`roleId`,
    (SELECT fallback.`id` FROM `Role` fallback WHERE fallback.`name` = 'USER' LIMIT 1)
);

ALTER TABLE `User` MODIFY `roleId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_RoleToUser`;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
