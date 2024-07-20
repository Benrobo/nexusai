import type { Context } from "telegraf";

export async function isGroupAuthenticated(ctx: Context, next: Function) {
  if (ctx.chat?.type !== "group") {
    ctx.reply("This bot is only for group chats.");
    return;
  }

  next();
}
