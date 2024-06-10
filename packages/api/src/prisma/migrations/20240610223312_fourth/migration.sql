/*
  Warnings:

  - You are about to drop the `Agents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ConversationAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ForwardingNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KnowledgeBaseData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LinkedKnowledgeBase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageEntity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProtectedNumbers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UsedPhoneNumbers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Agents";

-- DropTable
DROP TABLE "ConversationAccount";

-- DropTable
DROP TABLE "Conversations";

-- DropTable
DROP TABLE "ForwardingNumber";

-- DropTable
DROP TABLE "KnowledgeBaseData";

-- DropTable
DROP TABLE "LinkedKnowledgeBase";

-- DropTable
DROP TABLE "MessageEntity";

-- DropTable
DROP TABLE "Messages";

-- DropTable
DROP TABLE "ProtectedNumbers";

-- DropTable
DROP TABLE "UsedPhoneNumbers";

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AgentType" NOT NULL,
    "welcome_message" TEXT,
    "seed_phrase" TEXT,
    "custom_prompt" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forwarding_numbers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dial_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forwarding_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protected_numbers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dial_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "protected_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "used_phone_numbers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dial_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "used_phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_data" (
    "id" TEXT NOT NULL,
    "type" "KnowledgeBaseType" NOT NULL,
    "title" TEXT,
    "embedding" vector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linked_knowledge_base" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "kb_data_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linked_knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_account" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "con_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_entity" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,

    CONSTRAINT "message_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "convId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentsId" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agents_userId_idx" ON "agents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "forwarding_numbers_agentId_key" ON "forwarding_numbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "forwarding_numbers_phone_key" ON "forwarding_numbers"("phone");

-- CreateIndex
CREATE INDEX "forwarding_numbers_agentId_idx" ON "forwarding_numbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "protected_numbers_phone_key" ON "protected_numbers"("phone");

-- CreateIndex
CREATE INDEX "protected_numbers_agentId_idx" ON "protected_numbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "used_phone_numbers_phone_key" ON "used_phone_numbers"("phone");

-- CreateIndex
CREATE INDEX "used_phone_numbers_agentId_idx" ON "used_phone_numbers"("agentId");

-- CreateIndex
CREATE INDEX "used_phone_numbers_userId_idx" ON "used_phone_numbers"("userId");

-- CreateIndex
CREATE INDEX "linked_knowledge_base_agentId_idx" ON "linked_knowledge_base"("agentId");

-- CreateIndex
CREATE INDEX "linked_knowledge_base_kb_data_id_idx" ON "linked_knowledge_base"("kb_data_id");

-- CreateIndex
CREATE INDEX "conversations_wsId_idx" ON "conversations"("wsId");

-- CreateIndex
CREATE INDEX "conversations_agentId_idx" ON "conversations"("agentId");

-- CreateIndex
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");

-- CreateIndex
CREATE INDEX "conversation_account_wsId_idx" ON "conversation_account"("wsId");

-- CreateIndex
CREATE INDEX "conversation_account_con_user_id_idx" ON "conversation_account"("con_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "message_entity_entityId_key" ON "message_entity"("entityId");

-- CreateIndex
CREATE INDEX "messages_entityId_idx" ON "messages"("entityId");

-- CreateIndex
CREATE INDEX "messages_agentsId_idx" ON "messages"("agentsId");

-- CreateIndex
CREATE INDEX "messages_convId_idx" ON "messages"("convId");
