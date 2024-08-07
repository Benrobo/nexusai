import prisma from "./prisma/prisma.js";

export function isGroupAuthenticated(fn) {
  return async (ctx) => {
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
        ctx.reply(
          `Unauthorized group. Please authenticate the bot first. \n\nTo authenticate the bot, head over to https://trynexusai.xyz agent integration page, add a telegram integration and follow the instructions provided.`
        );
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
    } catch (e) {
      console.error("[isGroupAuthenticated]: Error authenticating group", e);
      ctx.reply("Error authenticating group");
    }
  };
}
