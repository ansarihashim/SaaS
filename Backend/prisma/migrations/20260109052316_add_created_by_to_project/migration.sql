/*
  Warnings:

  - Added the required column `createdById` to the `Project` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column as nullable first
ALTER TABLE "Project" ADD COLUMN "createdById" INTEGER;

-- Step 2: Set existing projects to be created by first user
UPDATE "Project" 
SET "createdById" = (SELECT id FROM "User" LIMIT 1)
WHERE "createdById" IS NULL;

-- Step 3: Make column NOT NULL
ALTER TABLE "Project" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
