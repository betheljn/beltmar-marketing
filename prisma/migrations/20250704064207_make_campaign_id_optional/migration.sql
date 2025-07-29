/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Suggestion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_campaignId_fkey";

-- AlterTable
ALTER TABLE "Suggestion" DROP COLUMN "updatedAt",
ADD COLUMN     "type" TEXT,
ALTER COLUMN "campaignId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
