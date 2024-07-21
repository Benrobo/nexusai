// telegram helper methods
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma.js";

export default class TelegramHelper {
  public async getTelegramGroupHistory(groupId: string) {
    const history = await prisma.telegramGroupHistory.findFirst({
      where: { group_id: groupId },
      include: { group_content: true },
    });

    return history;
  }

  public async getTelegramGroupHistoryText(groupId: string) {
    const history = await this.getTelegramGroupHistory(groupId);
    let historyTxt = "";

    if (history) {
      history.group_content.slice(-10).forEach((content) => {
        historyTxt += `[${content.role}]: ${content.content}\n`;
      });
    }

    return historyTxt;
  }

  public async storeTelegramGroupHistory(data: {
    groupId: string;
    content: string;
    role: "user" | "bot";
  }) {
    const { groupId, content, role } = data;
    const historyExists = await this.getTelegramGroupHistory(groupId);

    if (historyExists) {
      const historyContent = await prisma.telegramGroupHistoryContent.create({
        data: {
          id: shortUUID.generate(),
          groupHistoryId: historyExists.id,
          content,
          role,
        },
      });

      return historyContent;
    } else {
      const hId = shortUUID.generate();
      const history = await prisma.telegramGroupHistory.create({
        data: {
          id: hId,
          group_id: groupId,
          group_content: {
            create: {
              id: shortUUID.generate(),
              content,
              role,
            },
          },
        },
      });

      return history;
    }
  }
}
