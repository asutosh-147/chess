/*
  Warnings:

  - Made the column `profilePic` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profilePic" SET NOT NULL,
ALTER COLUMN "lastLogin" SET DEFAULT CURRENT_TIMESTAMP;
