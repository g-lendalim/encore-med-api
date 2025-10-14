/*
  Warnings:

  - The `sex` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `position` on table `Staff` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "bio" TEXT;

-- AlterTable
ALTER TABLE "Staff" ALTER COLUMN "position" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "sex",
ADD COLUMN     "sex" "Sex";
