import env from "../config/env.js";
import { Telegraf, Context } from "telegraf";
import { isGroupAuthenticated } from "../middlewares/telegram.js";
import logger from "../config/logger.js";
import prisma from "../prisma/prisma.js";
import shortUUID from "short-uuid";
import type {
  LeftChatMemberMessageType,
  MessageContext,
} from "../types/telegram.type.js";
import type { Update } from "telegraf/typings/core/types/typegram.js";
import AIService from "./AI.service.js";

const botCommands = [
  {
    command: "start",
    handler: (ctx: Context) => {
      ctx.reply("Welcome to Nexusai Bot");
    },
  },
  {
    command: "auth",
    handler: async (ctx: MessageContext, bot: Telegraf<Context<Update>>) => {
      const groupId = ctx.chat.id;
      const groupName = ctx.chat.type === "group" ? ctx.chat.title : null;
      const messageText = ctx.message.text;
      const token = messageText.split(" ")[1];
      const botId = bot.botInfo.id;

      if (!token || token.length === 0) {
        sendTgMessage(ctx, "⚠️ *Please provide a valid token to authenticate*");
        return;
      }

      const loadingMessage = await ctx.reply("🔄 Authenticating...");
      try {
        const botToken = await prisma.telegramIntConfig.findUnique({
          where: { auth_token: token },
          include: { groups: true },
        });

        if (!botToken) {
          console.error("Invalid token provided, bot token not found.");
          await editTgMessage(
            ctx,
            "⚠️ *Invalid token provided*",
            loadingMessage.message_id,
            ctx.chat.id
          );
          return;
        }

        const existingBot = await prisma.telegramBotGroups.findMany({
          where: { group_id: String(groupId) },
        });

        if (existingBot.length > 0) {
          console.log(
            "❌ One NEXUSAI bot can only be authenticated to one group."
          );
          await editTgMessage(
            ctx,
            "❌ *One NEXUSAI bot can only be authenticated to one group*",
            loadingMessage.message_id,
            ctx.chat.id
          );
          return;
        }

        const updateTgConf = prisma.telegramIntConfig.update({
          where: {
            id: botToken.id,
            auth_token: token,
          },
          data: {
            bot_id: String(botId),
          },
        });

        const createGroup = prisma.telegramBotGroups.create({
          data: {
            id: shortUUID.generate(),
            group_id: String(groupId),
            group_name: groupName,
            tgIntConfigId: botToken.id,
          },
        });

        await prisma.$transaction([updateTgConf, createGroup]);

        editTgMessage(
          ctx,
          "✅ *Bot authenticated successfully*",
          loadingMessage.message_id,
          ctx.chat.id
        );
        sendTgMessage(ctx, "🎉", false);
      } catch (e: any) {
        console.error("Error authenticating bot", e);
        await editTgMessage(
          ctx,
          "⚠️ *Error authenticating bot*",
          loadingMessage.message_id,
          ctx.chat.id
        );
      }
    },
  },
];

export default class TelegramBotService {
  bot: Telegraf<Context<Update>>;
  aiService: AIService;

  constructor() {
    try {
      this.bot = new Telegraf(env.TG.BOT_TOKEN);
      this.aiService = new AIService();
      this.init();
      this.bot.launch();
    } catch (e) {
      logger.error("Error initializing Telegram Bot", e);
    }
  }

  private init() {
    this.bot.start((ctx) => {
      ctx.reply(
        "🎉 *Welcome to the Bot!* 🚀\n\n" +
          "_Here are some commands you can use:_\n" +
          "`/help` - Get assistance\n" +
          `[Click Here](https://example.com) - Visit our website\n` +
          "Hope you enjoy using the bot! 😊",
        { parse_mode: "Markdown" }
      );
    });

    this.bot.on("text", (ctx) => {
      this.handleTextMessages(ctx as any);
    });

    this.bot.on("sticker", (ctx) => {
      const stickerFileId = ctx.message.sticker.file_id;
      console.log("Received sticker file ID:", stickerFileId);
      ctx.reply(`Sticker file ID: ${stickerFileId}`);
    });

    this.bot.on("left_chat_member", (ctx) =>
      this.botKickedFromGroup(ctx as any)
    );
  }

  private async botKickedFromGroup(
    ctx: MessageContext & LeftChatMemberMessageType
  ) {
    if (ctx.message.left_chat_member.id === ctx.botInfo.id) {
      const groupId = ctx.chat.id;
      try {
        const group = await prisma.telegramBotGroups.findFirst({
          where: { group_id: String(groupId) },
        });

        if (!group) {
          logger.error(
            "[Bot_Kicked]: Failed to removed bot config from group model"
          );
          return;
        } else {
          await prisma.telegramBotGroups.delete({
            where: { id: group.id },
          });
          logger.info(`[Bot_Kicked]: Bot removed from group ${groupId}`);
        }
      } catch (e: any) {
        console.error("[Bot_Kicked]: Error removing bot from group", e);
      }
    }
  }

  private async handleTextMessages(
    ctx: MessageContext & {
      nexusAgentConfig: {
        groupId: string;
        integrationId: string;
        agentId: string;
      };
    }
  ) {
    const messageText = ctx.message.text.toLowerCase();
    const botUsername = this.bot.botInfo?.username;

    if (botUsername && messageText.includes(`@${botUsername.toLowerCase()}`)) {
      isGroupAuthenticated(this.handleBotMentions.bind(this))(ctx);
    }
    if (messageText.startsWith("/")) {
      const command = messageText.split(" ")[0].replace("/", "");
      const handler = botCommands.find((c) => c.command === command)?.handler;
      if (handler) handler(ctx, this.bot);
    }
  }

  private async handleBotMentions(
    ctx: MessageContext & {
      nexusAgentConfig: {
        groupId: string;
        integrationId: string;
        agentId: string;
      };
    }
  ) {
    const { agentId, integrationId, groupId } = ctx.nexusAgentConfig;
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    const userQuery = ctx.message.text.split(" ").slice(1).join(" ");

    // const loadingMessage = await ctx.reply("🔄 Thinking...");
    const loadingMessage = ctx.telegram.sendMessage(
      ctx.chat.id,
      "🔄 Thinking...",
      {
        reply_markup: {
          selective: false,
          // @ts-expect-error
          force_reply: false,
        },
        reply_parameters: {
          message_id: messageId,
          chat_id: chatId,
        },
        parse_mode: "Markdown",
      }
    );

    try {
      const aiResponse =
        await this.aiService.handleTelegramCustomerSupportRequest({
          agentId,
          userMessage: userQuery,
          groupId,
        });

      if (aiResponse?.error !== null) {
        throw new Error(aiResponse.error);
      }

      await editTgMessage(
        ctx,
        aiResponse?.data?.aiResp,
        (await loadingMessage).message_id,
        chatId
      );
    } catch (e: any) {
      console.log("");
      console.error(
        "[Gemini Bot Mention]: Error handling bot mentions with gemini",
        e
      );
      await editTgMessage(
        ctx,
        "⚠️ *Something went wrong,*",
        (await loadingMessage).message_id,
        chatId
      );
    }
  }
}

function sendTgMessage(
  ctx: MessageContext,
  message: string,
  shouldReply = true
) {
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;

  if (message.length === 0) {
    throw new Error("Message cannot be empty");
  }

  if (shouldReply) {
    ctx.telegram.sendMessage(ctx.chat.id, message, {
      reply_markup: {
        selective: false,
        // @ts-expect-error
        force_reply: false,
      },
      reply_parameters: {
        message_id: messageId,
        chat_id: chatId,
      },
      parse_mode: "Markdown",
    });
  } else {
    ctx.telegram.sendMessage(ctx.chat.id, message);
  }
}

async function editTgMessage(
  ctx: MessageContext,
  message: string,
  messageId: number,
  chatId: number
) {
  if (message.length === 0) {
    throw new Error("Message cannot be empty");
  }

  await ctx.telegram.editMessageText(chatId, messageId, null, message, {
    parse_mode: "Markdown",
  });
}
