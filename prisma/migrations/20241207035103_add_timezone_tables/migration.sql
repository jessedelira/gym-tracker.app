-- CreateTable
CREATE TABLE `user_setting` (
    `id` VARCHAR(191) NOT NULL,
    `timezone_map_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `timezone_map` (
    `id` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `timezone_map_timezone_key`(`timezone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_setting` ADD CONSTRAINT `user_setting_timezone_map_id_fkey` FOREIGN KEY (`timezone_map_id`) REFERENCES `timezone_map`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_setting` ADD CONSTRAINT `user_setting_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
