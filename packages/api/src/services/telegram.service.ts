import type { Update, Message } from "telegraf/typings/core/types/typegram";
import env from "../config/env.js";
import { Telegraf, Context } from "telegraf";
import { isGroupAuthenticated } from "../middlewares/telegram.js";

const botCommands = [
  {
    command: "start",
    handler: (ctx: Context) => {
      ctx.reply("Welcome to Nexusai Bot");
    },
  },
  {
    command: "auth",
    handler: (ctx: Context) => {
      ctx.reply("Please authenticate yourself.");
    },
  },
];

type MessageContext = Context & {
  message: Update.New & Update.NonChannel & Message.TextMessage;
};

export default class TelegramBotService {
  bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(env.TG.BOT_TOKEN);
    this.init();
    this.bot.launch();
  }

  private init() {
    this.bot.start((ctx) => {
      //   ctx.reply("Welcome to Nexusai Bot");
      ctx.reply(
        "🎉 *Welcome to the Bot!* 🚀\n\n" +
          "_Here are some commands you can use:_\n" +
          "`/help` - Get assistance\n" +
          `[Click Here](https://example.com) - Visit our website\n` +
          "Hope you enjoy using the bot! 😊",
        { parse_mode: "Markdown" }
      );
    });

    this.bot.on("text", isGroupAuthenticated, (ctx) =>
      this.handleTextMessages(ctx)
    );
    this.initCommands();
  }

  private initCommands() {
    botCommands.forEach(({ command, handler }) => {
      this.bot.command(command, handler);
    });
  }

  private async handleTextMessages(ctx: MessageContext) {
    const messageText = ctx.message.text.toLowerCase();
    const botUsername = this.bot.botInfo?.username;

    console.log({ messageText, botUsername });

    if (botUsername && messageText.includes(`@${botUsername.toLowerCase()}`)) {
      await this.handleBotMentions(ctx);
    } else {
      console.log("Regular message:", messageText);
    }
  }

  private async handleBotMentions(ctx: MessageContext) {
    console.log(ctx);
    const chatId = ctx.chat.id;
    const messageId = ctx.message.message_id;

    const loadingMessage = await ctx.reply("🔄 Thinking...");

    setTimeout(async () => {
      // Edit the loading message with the actual response
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        loadingMessage.message_id,
        null,
        `We offer a wide range of services including:

- Software Development
- IT Consulting
- Cloud Computing Solutions
- Cybersecurity Services
- Data Analytics
- AI and Machine Learning
- Web Development
- Mobile App Development
- IT Support and Maintenance
- Network Solutions 
`
      );
    }, 3000); // Adjus

    const fakeResp = `
    I'm great, thanks for asking 🥰. Hello Ben, how can i help you today?
    `;

    // ctx.telegram.sendMessage(ctx.chat.id, fakeResp, {
    //   reply_markup: {
    //     selective: true,
    //     force_reply: true,
    //   },
    //   reply_parameters: {
    //     message_id: messageId,
    //     chat_id: chatId,
    //   },
    //   parse_mode: "Markdown",
    // });
  }
}
