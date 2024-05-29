/*
  Warnings:

  - The values [CUSTOMER_SUPPORT] on the enum `AgentPurpose` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgentPurpose_new" AS ENUM ('ANTI_THEFT', 'AUTOMATED_CUSTOMER_SUPPORT', 'CHATBOT');
ALTER TABLE "Agents" ALTER COLUMN "purpose" TYPE "AgentPurpose_new" USING ("purpose"::text::"AgentPurpose_new");
ALTER TYPE "AgentPurpose" RENAME TO "AgentPurpose_old";
ALTER TYPE "AgentPurpose_new" RENAME TO "AgentPurpose";
DROP TYPE "AgentPurpose_old";
COMMIT;

-- AlterTable
ALTER TABLE "Agents" ADD COLUMN     "country" TEXT,
ADD COLUMN     "country_code" TEXT;

-- DropTable
DROP TABLE "Workspace";

-- DropTable
DROP TABLE "WorkspaceSettings";

-- CreateTable
CREATE TABLE "VerifiedPhoneNumbers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isInUse" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerifiedPhoneNumbers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerifiedPhoneNumbers_phone_key" ON "VerifiedPhoneNumbers"("phone");

-- CreateIndex
CREATE INDEX "VerifiedPhoneNumbers_userId_idx" ON "VerifiedPhoneNumbers"("userId");
