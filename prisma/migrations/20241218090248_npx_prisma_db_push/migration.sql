/*
  Warnings:

  - Added the required column `amount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripePaymentId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_orderedById_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_orderedById_fkey`;

-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `productoncart` DROP FOREIGN KEY `ProductOnCart_productId_fkey`;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `amount` INTEGER NOT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `stripePaymentId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_orderedById_fkey` FOREIGN KEY (`orderedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductOnCart` ADD CONSTRAINT `ProductOnCart_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_orderedById_fkey` FOREIGN KEY (`orderedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
