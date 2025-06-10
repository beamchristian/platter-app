/*
  Warnings:

  - You are about to drop the column `templateId` on the `platter_orders` table. All the data in the column will be lost.
  - You are about to drop the column `ingredients` on the `platter_templates` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `platter_templates` table. All the data in the column will be lost.
  - Added the required column `variationId` to the `platter_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlatterSizeEnum" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PlatterOptionTypeEnum" AS ENUM ('SUB_OPTION', 'MEAT', 'CHEESE', 'COOKIE_FLAVOR', 'BRIE_FLAVOR', 'GENERAL_ITEM');

-- DropForeignKey
ALTER TABLE "platter_orders" DROP CONSTRAINT "platter_orders_templateId_fkey";

-- AlterTable
ALTER TABLE "platter_orders" DROP COLUMN "templateId",
ADD COLUMN     "substitutePreference" TEXT,
ADD COLUMN     "variationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "platter_templates" DROP COLUMN "ingredients",
DROP COLUMN "instructions",
ADD COLUMN     "baseInstructions" TEXT;

-- CreateTable
CREATE TABLE "platter_template_variations" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "size" "PlatterSizeEnum" NOT NULL,
    "sizeDescription" TEXT,
    "price" MONEY NOT NULL,
    "maxSelections" INTEGER,

    CONSTRAINT "platter_template_variations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platter_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlatterOptionTypeEnum" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platter_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platter_option_availability" (
    "id" TEXT NOT NULL,
    "variationId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "minSelections" INTEGER,
    "maxSelections" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "platter_option_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platter_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "platter_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platter_options_name_key" ON "platter_options"("name");

-- CreateIndex
CREATE UNIQUE INDEX "platter_option_availability_variationId_optionId_key" ON "platter_option_availability"("variationId", "optionId");

-- CreateIndex
CREATE UNIQUE INDEX "platter_order_items_orderId_optionId_key" ON "platter_order_items"("orderId", "optionId");

-- AddForeignKey
ALTER TABLE "platter_template_variations" ADD CONSTRAINT "platter_template_variations_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "platter_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platter_option_availability" ADD CONSTRAINT "platter_option_availability_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "platter_template_variations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platter_option_availability" ADD CONSTRAINT "platter_option_availability_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "platter_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platter_orders" ADD CONSTRAINT "platter_orders_variationId_fkey" FOREIGN KEY ("variationId") REFERENCES "platter_template_variations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platter_order_items" ADD CONSTRAINT "platter_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "platter_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platter_order_items" ADD CONSTRAINT "platter_order_items_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "platter_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
