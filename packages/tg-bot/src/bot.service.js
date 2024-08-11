import env from "./config/env.js";
import { Telegraf } from "telegraf";
import { isGroupAuthenticated } from "./isGroupAuthenticated.js";
import logger from "./config/logger.js";
import prisma from "./prisma/prisma.js";
import shortUUID from "short-uuid";
import retry from "async-retry";
import { getAIResponse } from "./api/index.js";
import { message } from "telegraf/filters";
import redis from "./config/redis.js";

const botCommands = [
  {
    command: "start",
    handler: (ctx) => {
      ctx.reply("Welcome to Nexusai Bot");
    },
  },
  {
    command: "auth",
    handler: async (ctx, bot) => {
      if (ctx.chat.type !== "group") {
        sendTgMessage(
          ctx,
          "❌ This bot is only mean't for group chats.",
          false
        );
        return;
      }

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
      } catch (e) {
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
  bot;

  constructor() {
    this.initBot();
  }

  async initBot() {
    try {
      await retry(
        async () => {
          this.bot = new Telegraf(env.TG_BOT_TOKEN);
          this.init();
          await this.bot.launch(() => {
            logger.info("✅ Telegram Bot launched successfully");
          });
        },
        {
          retries: 5,
          minTimeout: 500,
          onRetry: (attempt) => {
            console.log("");
            logger.warn(
              `Retrying to initialize Telegram Bot: Attempt ${attempt}`
            );
          },
        }
      );
    } catch (e) {
      console.log("");
      logger.error("Error initializing Telegram Bot after retries", e);
      console.log("");
    }
  }

  init() {
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

    this.bot.on(message("text"), (ctx) => {
      console.log("Received text message:", ctx.message.text);
      this.handleTextMessages(ctx);
    });

    // this.bot.on("sticker", (ctx) => {
    //   const stickerFileId = ctx.message.sticker.file_id;
    //   console.log("Received sticker file ID:", stickerFileId);
    //   ctx.reply(`Sticker file ID: ${stickerFileId}`);
    // });

    this.bot.on(message("left_chat_member"), (ctx) =>
      this.botKickedFromGroup(ctx)
    );
  }

  async botKickedFromGroup(ctx) {
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
          await redis.del(`tg-history:${groupId}`);
          logger.info(
            `[Bot_Kicked]: Telegram history cleared for group ${groupId}`
          );
        }
      } catch (e) {
        console.error("[Bot_Kicked]: Error removing bot from group", e);
      }
    }
  }

  async handleTextMessages(ctx) {
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

  async handleBotMentions(ctx) {
    const { agentId, groupId } = ctx.nexusAgentConfig;
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;
    const tgMsg = ctx.message.text;
    const wrdWithMention = tgMsg
      .split(" ")
      .find((wrd) => wrd.includes(`@${this.bot.botInfo.username}`));
    const userQuery = tgMsg.replaceAll(wrdWithMention, `@agent`);
    const senderName = `@${ctx.message.from.username}`;
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
      const aiResponse = await handleTelegramCustomerSupportRequest({
        agentId,
        userQuery,
        groupId,
        senderName,
      });

      if (aiResponse?.error !== null) {
        throw new Error(aiResponse.error);
      }

      await editTgMessage(
        ctx,
        aiResponse?.data,
        (await loadingMessage).message_id,
        chatId
      );
    } catch (e) {
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

async function handleTelegramCustomerSupportRequest({
  agentId,
  userQuery,
  groupId,
  senderName,
}) {
  let _resp = {
    error: null,
    success: null,
    data: null,
  };
  try {
    const resp = await getAIResponse({
      agentId,
      userQuery,
      groupId,
      senderName,
    });
    const data = resp?.data;

    if (!data) {
      throw new Error("Invalid response from AI service");
    }

    _resp.data = data;
  } catch (e) {
    console.error(
      "[handleTelegramCustomerSupportRequest]: Error handling customer support request",
      e
    );
    _resp.error = e.message;
  }

  return _resp;
}

function sendTgMessage(ctx, message, shouldReply = true) {
  const chatId = ctx.chat.id;
  const messageId = ctx.message.message_id;

  if (message.length === 0) {
    throw new Error("Message cannot be empty");
  }

  if (shouldReply) {
    ctx.telegram.sendMessage(ctx.chat.id, message, {
      reply_markup: {
        selective: false,
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

async function editTgMessage(ctx, message, messageId, chatId) {
  if (message.length === 0) {
    throw new Error("Message cannot be empty");
  }

  await ctx.telegram.editMessageText(chatId, messageId, null, message, {
    parse_mode: "Markdown",
  });
}
