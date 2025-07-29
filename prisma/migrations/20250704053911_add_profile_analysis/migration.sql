-- CreateTable
CREATE TABLE "ProfileAnalysis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "ProfileAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileAnalysis_userId_key" ON "ProfileAnalysis"("userId");

-- AddForeignKey
ALTER TABLE "ProfileAnalysis" ADD CONSTRAINT "ProfileAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
