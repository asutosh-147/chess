/*
  Warnings:

  - You are about to drop the column `move` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `timeTaken` on the `Move` table. All the data in the column will be lost.
  - Added the required column `moveNumber` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Move" DROP COLUMN "move",
DROP COLUMN "timeTaken",
ADD COLUMN     "moveNumber" INTEGER NOT NULL;
