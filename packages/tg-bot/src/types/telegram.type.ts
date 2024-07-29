// import type { Update, Message } from "telegraf/typings/core/types/typegram";
// import { Context } from "telegraf";
import { Context, NarrowedContext, Telegraf, MiddlewareFn } from "telegraf";
import { Update, Message } from "telegraf/typings/core/types/typegram";

export type MiddlewareContext = NarrowedContext<Context, Update> & {
  nexusAgentConfig: {
    groupId: string;
    integrationId: string;
    agentId: string;
  };
};

export type MessageContext = Context & {
  message: Update.New &
    Update.NonChannel &
    Message.TextMessage & { groupId: string };
  // | Message.LeftChatMemberMessage;
};

export type LeftChatMemberMessageType = Context & {
  message: Update.New & Update.NonChannel & Message.LeftChatMemberMessage;
};

export type AIReqProps = {
  agentId: string;
  userQuery: string;
  groupId: string;
};
