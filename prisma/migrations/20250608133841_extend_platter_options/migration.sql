/*
  Warnings:

  - A unique constraint covering the columns `[templateId,size]` on the table `platter_template_variations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "platter_template_variations_templateId_size_key" ON "platter_template_variations"("templateId", "size");
