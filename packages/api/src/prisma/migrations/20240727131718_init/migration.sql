-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('google_calendar', 'google_meet', 'telegram');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('ANTI_THEFT', 'SALES_ASSISTANT', 'CHATBOT');

-- CreateEnum
CREATE TYPE "ChatMsgRoles" AS ENUM ('agent', 'admin', 'customer');

-- CreateEnum
CREATE TYPE "CallLogMsgType" AS ENUM ('agent', 'user');

-- CreateEnum
CREATE TYPE "CallLogAnalysisType" AS ENUM ('positive', 'negative', 'neutral');

-- CreateEnum
CREATE TYPE "KnowledgeBaseType" AS ENUM ('TXT', 'WEB_PAGES', 'PDF', 'YT_VIDEOS', 'NOTION');

-- CreateEnum
CREATE TYPE "KnowledgeBaseStatus" AS ENUM ('trained', 'untrained');

-- CreateEnum
CREATE TYPE "HandoverCondition" AS ENUM ('emergency', 'help');

-- CreateEnum
CREATE TYPE "TelegramGroupHistoryContentRole" AS ENUM ('bot', 'user');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('on_trial', 'active', 'paused', 'past_due', 'unpaid', 'cancelled', 'expired');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('IN_APP', 'TWILIO_PHONE_NUMBERS');

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
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AgentType" NOT NULL,
    "activated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_settings" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "welcome_message" TEXT,
    "allow_handover" BOOLEAN NOT NULL DEFAULT false,
    "handover_condition" "HandoverCondition" DEFAULT 'emergency',
    "security_code" TEXT,

    CONSTRAINT "agent_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_config" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "brand_name" TEXT,
    "logo" TEXT,
    "brand_color" TEXT,
    "text_color" TEXT,
    "welcome_message" TEXT,
    "suggested_questions" TEXT,

    CONSTRAINT "chatbot_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forwarding_numbers" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
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
CREATE TABLE "purchased_phone_numbers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT,
    "sub_id" TEXT,
    "agent_id" TEXT,
    "phone_number_sid" TEXT,
    "bundle_sid" TEXT,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchased_phone_numbers_pkey" PRIMARY KEY ("id")
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
    "is_deleted" BOOLEAN DEFAULT false,

    CONSTRAINT "used_phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KnowledgeBaseStatus" DEFAULT 'untrained',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_base_data" (
    "id" TEXT NOT NULL,
    "kb_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "KnowledgeBaseType" NOT NULL,
    "title" TEXT,
    "embedding" vector,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linked_knowledge_base" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "kb_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "linked_knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_int_config" (
    "id" TEXT NOT NULL,
    "intId" TEXT NOT NULL,
    "auth_token" TEXT,
    "bot_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_int_config_pkey" PRIMARY KEY ("intId")
);

-- CreateTable
CREATE TABLE "telegram_bot_groups" (
    "id" TEXT NOT NULL,
    "tgIntConfigId" TEXT NOT NULL,
    "group_id" TEXT,
    "group_name" TEXT,

    CONSTRAINT "telegram_bot_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_group_conv_history" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_group_conv_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "telegram_group_conv_history_content" (
    "id" TEXT NOT NULL,
    "groupHistoryId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "TelegramGroupHistoryContentRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_group_conv_history_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversationAccountId" TEXT,
    "admin_in_control" BOOLEAN DEFAULT false,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_widget_account" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "refresh_token" TEXT,
    "country_code" TEXT,
    "state" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_widget_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "convId" TEXT NOT NULL,
    "role" "ChatMsgRoles" NOT NULL,
    "senderId" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agentId" TEXT,
    "is_read_customer" BOOLEAN DEFAULT false,
    "is_read_admin" BOOLEAN DEFAULT false,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "from_number" TEXT NOT NULL,
    "to_number" TEXT NOT NULL,
    "caller_country" TEXT NOT NULL,
    "caller_state" TEXT,
    "zip_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN DEFAULT false,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs_messages" (
    "id" TEXT NOT NULL,
    "call_log_id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "entity_type" "CallLogMsgType",
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_log_entry" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "callReason" TEXT,
    "callerName" TEXT,
    "referral" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_log_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_logs_analysis" (
    "id" TEXT NOT NULL,
    "callLogId" TEXT NOT NULL,
    "sentiment" TEXT,
    "suggested_action" TEXT,
    "confidence" INTEGER,
    "type" "CallLogAnalysisType",
    "red_flags" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_logs_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "uId" TEXT NOT NULL,
    "user_name" TEXT,
    "user_email" TEXT,
    "agent_id" TEXT,
    "type" "SubscriptionType" NOT NULL,
    "grace_period" TIMESTAMP(3),
    "product_id" TEXT NOT NULL,
    "product_name" TEXT,
    "variant_id" TEXT,
    "variant_name" TEXT,
    "order_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "is_deleted" BOOLEAN DEFAULT false,
    "subscription_id" TEXT,
    "customer_id" TEXT,
    "card_brand" TEXT,
    "card_last_four" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'on_trial',
    "ends_at" TIMESTAMP(3),
    "renews_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "test_mode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uId_key" ON "users"("uId");

-- CreateIndex
CREATE INDEX "agents_userId_idx" ON "agents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_settings_agentId_key" ON "agent_settings"("agentId");

-- CreateIndex
CREATE INDEX "agent_settings_agentId_idx" ON "agent_settings"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_config_agentId_key" ON "chatbot_config"("agentId");

-- CreateIndex
CREATE INDEX "chatbot_config_agentId_idx" ON "chatbot_config"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "forwarding_numbers_agentId_key" ON "forwarding_numbers"("agentId");

-- CreateIndex
CREATE INDEX "forwarding_numbers_agentId_idx" ON "forwarding_numbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "protected_numbers_phone_key" ON "protected_numbers"("phone");

-- CreateIndex
CREATE INDEX "protected_numbers_agentId_idx" ON "protected_numbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "purchased_phone_numbers_phone_key" ON "purchased_phone_numbers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "purchased_phone_numbers_sub_id_key" ON "purchased_phone_numbers"("sub_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchased_phone_numbers_agent_id_key" ON "purchased_phone_numbers"("agent_id");

-- CreateIndex
CREATE INDEX "purchased_phone_numbers_userId_idx" ON "purchased_phone_numbers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "used_phone_numbers_agentId_key" ON "used_phone_numbers"("agentId");

-- CreateIndex
CREATE UNIQUE INDEX "used_phone_numbers_phone_key" ON "used_phone_numbers"("phone");

-- CreateIndex
CREATE INDEX "used_phone_numbers_agentId_idx" ON "used_phone_numbers"("agentId");

-- CreateIndex
CREATE INDEX "used_phone_numbers_userId_idx" ON "used_phone_numbers"("userId");

-- CreateIndex
CREATE INDEX "knowledge_base_userId_idx" ON "knowledge_base"("userId");

-- CreateIndex
CREATE INDEX "knowledge_base_data_kb_id_idx" ON "knowledge_base_data"("kb_id");

-- CreateIndex
CREATE INDEX "linked_knowledge_base_agentId_idx" ON "linked_knowledge_base"("agentId");

-- CreateIndex
CREATE INDEX "linked_knowledge_base_kb_id_idx" ON "linked_knowledge_base"("kb_id");

-- CreateIndex
CREATE INDEX "integrations_agent_id_idx" ON "integrations"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_int_config_id_key" ON "telegram_int_config"("id");

-- CreateIndex
CREATE UNIQUE INDEX "telegram_int_config_auth_token_key" ON "telegram_int_config"("auth_token");

-- CreateIndex
CREATE INDEX "telegram_int_config_intId_idx" ON "telegram_int_config"("intId");

-- CreateIndex
CREATE INDEX "telegram_bot_groups_tgIntConfigId_idx" ON "telegram_bot_groups"("tgIntConfigId");

-- CreateIndex
CREATE INDEX "telegram_group_conv_history_group_id_idx" ON "telegram_group_conv_history"("group_id");

-- CreateIndex
CREATE INDEX "telegram_group_conv_history_content_groupHistoryId_idx" ON "telegram_group_conv_history_content"("groupHistoryId");

-- CreateIndex
CREATE INDEX "conversations_agentId_idx" ON "conversations"("agentId");

-- CreateIndex
CREATE INDEX "conversations_conversationAccountId_idx" ON "conversations"("conversationAccountId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_agentId_idx" ON "messages"("agentId");

-- CreateIndex
CREATE INDEX "messages_convId_idx" ON "messages"("convId");

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_refId_key" ON "call_logs"("refId");

-- CreateIndex
CREATE INDEX "call_logs_agentId_idx" ON "call_logs"("agentId");

-- CreateIndex
CREATE INDEX "call_logs_userId_idx" ON "call_logs"("userId");

-- CreateIndex
CREATE INDEX "call_logs_messages_fromId_idx" ON "call_logs_messages"("fromId");

-- CreateIndex
CREATE INDEX "call_logs_messages_toId_idx" ON "call_logs_messages"("toId");

-- CreateIndex
CREATE INDEX "call_logs_messages_call_log_id_idx" ON "call_logs_messages"("call_log_id");

-- CreateIndex
CREATE UNIQUE INDEX "call_log_entry_refId_key" ON "call_log_entry"("refId");

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_analysis_callLogId_key" ON "call_logs_analysis"("callLogId");

-- CreateIndex
CREATE INDEX "call_logs_analysis_callLogId_idx" ON "call_logs_analysis"("callLogId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_agent_id_key" ON "subscriptions"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscription_id_key" ON "subscriptions"("subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_uId_idx" ON "subscriptions"("uId");
