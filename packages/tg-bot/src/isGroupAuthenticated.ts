import type { MessageContext, MiddlewareContext } from "./types/telegram.type";

export function isGroupAuthenticated(fn: Function) {
  return async (
    ctx: MessageContext & {
      nexusAgentConfig: {
        groupId: string;
        integrationId: string;
        agentId: string;
      };
    }
  ) => {
    try {
      const groupId = ctx.chat?.id;
      if (ctx.chat?.type !== "group") {
        ctx.reply("This bot is only for group chats.");
        return;
      }

      if (!groupId) {
        ctx.reply("Group ID not found.");
        return;
      }

      // check if group is authenticated
      const group = await prisma.telegramBotGroups.findFirst({
        where: { group_id: String(groupId) },
        include: { tgIntConfig: true },
      });

      if (!group) {
        ctx.reply("Unauthorized group. Please authenticate the bot first.");
        return;
      }

      const intId = group.tgIntConfig?.intId;
      const integration = await prisma.integration.findUnique({
        where: { id: intId },
        select: { agent_id: true },
      });

      ctx.nexusAgentConfig = {
        groupId: String(groupId),
        integrationId: intId,
        agentId: integration.agent_id,
      };

      return await fn(ctx);
    } catch (e: any) {
      console.error("[isGroupAuthenticated]: Error authenticating group", e);
      ctx.reply("Error authenticating group");
    }
  };
}
