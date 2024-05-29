-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('google_calendar', 'google_meet');

-- CreateEnum
CREATE TYPE "AgentPurpose" AS ENUM ('ANTI_THEFT', 'CUSTOMER_SUPPORT');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('AGENT', 'USER', 'CONVERSATION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "uId" TEXT NOT NULL,
    "username" TEXT,
    "fullname" TEXT,
    "email" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "Role" NOT NULL DEFAULT 'user',
    "google_ref_token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceSettings" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agents" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" "AgentPurpose" NOT NULL,
    "phonenumber" TEXT,
    "welcome_message" TEXT,
    "seed_phrase" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversations" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "escalated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationAccount" (
    "id" TEXT NOT NULL,
    "wsId" TEXT NOT NULL,
    "con_user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageEntity" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,

    CONSTRAINT "MessageEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Messages" (
    "id" TEXT NOT NULL,
    "convId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentsId" TEXT,

    CONSTRAINT "Messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uId_key" ON "users"("uId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_id_key" ON "Workspace"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_name_key" ON "Workspace"("name");

-- CreateIndex
CREATE INDEX "Workspace_userId_idx" ON "Workspace"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceSettings_wsId_key" ON "WorkspaceSettings"("wsId");

-- CreateIndex
CREATE INDEX "WorkspaceSettings_wsId_idx" ON "WorkspaceSettings"("wsId");

-- CreateIndex
CREATE UNIQUE INDEX "Agents_wsId_key" ON "Agents"("wsId");

-- CreateIndex
CREATE INDEX "Agents_wsId_idx" ON "Agents"("wsId");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_wsId_key" ON "integrations"("wsId");

-- CreateIndex
CREATE INDEX "integrations_wsId_idx" ON "integrations"("wsId");

-- CreateIndex
CREATE INDEX "Conversations_wsId_idx" ON "Conversations"("wsId");

-- CreateIndex
CREATE INDEX "Conversations_agentId_idx" ON "Conversations"("agentId");

-- CreateIndex
CREATE INDEX "Conversations_userId_idx" ON "Conversations"("userId");

-- CreateIndex
CREATE INDEX "ConversationAccount_wsId_idx" ON "ConversationAccount"("wsId");

-- CreateIndex
CREATE INDEX "ConversationAccount_con_user_id_idx" ON "ConversationAccount"("con_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "MessageEntity_entityId_key" ON "MessageEntity"("entityId");

-- CreateIndex
CREATE INDEX "Messages_entityId_idx" ON "Messages"("entityId");

-- CreateIndex
CREATE INDEX "Messages_agentsId_idx" ON "Messages"("agentsId");

-- CreateIndex
CREATE INDEX "Messages_convId_idx" ON "Messages"("convId");
