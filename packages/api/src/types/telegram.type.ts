import type { Update, Message } from "telegraf/typings/core/types/typegram";
import { Context } from "telegraf";

export type MessageContext = Context & {
  message: Update.New & Update.NonChannel & Message.TextMessage;
  // | Message.LeftChatMemberMessage;
};

export type LeftChatMemberMessageType = Context & {
  message: Update.New & Update.NonChannel & Message.LeftChatMemberMessage;
};
