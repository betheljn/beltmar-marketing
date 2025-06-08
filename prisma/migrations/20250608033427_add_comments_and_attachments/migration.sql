-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_knotId_fkey";

-- AlterTable
ALTER TABLE "Campaign" ALTER COLUMN "knotId" DROP NOT NULL,
ALTER COLUMN "knotId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_knotId_fkey" FOREIGN KEY ("knotId") REFERENCES "Knot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
