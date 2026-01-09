/*
  Warnings:

  - Added the required column `createdById` to the `Task` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column as nullable first
ALTER TABLE "Task" ADD COLUMN "createdById" INTEGER;

-- Step 2: Set existing tasks to be created by first user (or assignee if exists)
UPDATE "Task" 
SET "createdById" = COALESCE("assigneeId", (SELECT id FROM "User" LIMIT 1))
WHERE "createdById" IS NULL;

-- Step 3: Make column NOT NULL
ALTER TABLE "Task" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
