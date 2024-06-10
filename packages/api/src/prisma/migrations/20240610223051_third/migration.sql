/*
  Warnings:

  - You are about to drop the column `country` on the `Agents` table. All the data in the column will be lost.
  - You are about to drop the column `country_code` on the `Agents` table. All the data in the column will be lost.
  - You are about to drop the column `phonenumber` on the `Agents` table. All the data in the column will be lost.
  - You are about to drop the column `purpose` on the `Agents` table. All the data in the column will be lost.
  - You are about to drop the column `wsId` on the `Agents` table. All the data in the column will be lost.
  - You are about to drop the `VerifiedPhoneNumbers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Agents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Agents` table without a default value. This is not possible if the table is not empty.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('ANTI_THEFT', 'AUTOMATED_CUSTOMER_SUPPORT', 'CHATBOT');

-- CreateEnum
CREATE TYPE "KnowledgeBaseType" AS ENUM ('TXT', 'WEB_PAGES', 'PDF', 'YT_VIDEOS', 'NOTION');

-- DropIndex
DROP INDEX "Agents_wsId_idx";

-- DropIndex
DROP INDEX "Agents_wsId_key";

-- AlterTable
ALTER TABLE "Agents" DROP COLUMN "country",
DROP COLUMN "country_code",
DROP COLUMN "phonenumber",
DROP COLUMN "purpose",
DROP COLUMN "wsId",
ADD COLUMN     "custom_prompt" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "AgentType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "VerifiedPhoneNumbers";

-- DropEnum
DROP TYPE "AgentPurpose";

-- CreateTable
CREATE TABLE "ForwardingNumber" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dial_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForwardingNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProtectedNumbers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dial_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtectedNumbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedPhoneNumbers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dial_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsedPhoneNumbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseData" (
    "id" TEXT NOT NULL,
    "type" "KnowledgeBaseType" NOT NULL,
    "title" TEXT,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBaseData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedKnowledgeBase" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "kb_data_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedKnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ForwardingNumber_agentId_key" ON "ForwardingNumber"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "ForwardingNumber_phone_key" ON "ForwardingNumber"("phone");

-- CreateIndex
CREATE INDEX "ForwardingNumber_agentId_idx" ON "ForwardingNumber"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProtectedNumbers_phone_key" ON "ProtectedNumbers"("phone");

-- CreateIndex
CREATE INDEX "ProtectedNumbers_agentId_idx" ON "ProtectedNumbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "UsedPhoneNumbers_phone_key" ON "UsedPhoneNumbers"("phone");

-- CreateIndex
CREATE INDEX "UsedPhoneNumbers_agentId_idx" ON "UsedPhoneNumbers"("agentId");

-- CreateIndex
CREATE INDEX "UsedPhoneNumbers_userId_idx" ON "UsedPhoneNumbers"("userId");

-- CreateIndex
CREATE INDEX "LinkedKnowledgeBase_agentId_idx" ON "LinkedKnowledgeBase"("agentId");

-- CreateIndex
CREATE INDEX "LinkedKnowledgeBase_kb_data_id_idx" ON "LinkedKnowledgeBase"("kb_data_id");

-- CreateIndex
CREATE INDEX "Agents_userId_idx" ON "Agents"("userId");
