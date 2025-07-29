-- AlterTable
ALTER TABLE "AgentTask" ADD COLUMN     "log" TEXT,
ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "goals" TEXT,
    "brandTone" TEXT,
    "contentPreferences" TEXT,
    "targetAudience" TEXT,
    "competitors" TEXT,
    "website" TEXT,
    "enableAIAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "enableTwitterAnalysis" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_userId_key" ON "Onboarding"("userId");

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
