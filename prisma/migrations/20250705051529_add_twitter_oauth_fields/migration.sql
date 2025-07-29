-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twitterAccessSecret" TEXT,
ADD COLUMN     "twitterAccessToken" TEXT,
ADD COLUMN     "twitterConnected" BOOLEAN NOT NULL DEFAULT false;
