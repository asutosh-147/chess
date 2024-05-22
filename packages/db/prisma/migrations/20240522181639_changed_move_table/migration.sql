/*
  Warnings:

  - Added the required column `color` to the `Move` table without a default value. This is not possible if the table is not empty.
  - Added the required column `piece` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Move" ADD COLUMN     "captured" TEXT,
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "piece" TEXT NOT NULL,
ADD COLUMN     "promotion" TEXT;
