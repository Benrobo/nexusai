import shortUUID from "short-uuid";
import redis from "../config/redis.js";

export default class TelegramHelper {
  public async getTelegramGroupHistory(groupId: string) {
    const history = await redis.get(`tg-history:${groupId}`);
    return history ? JSON.parse(history) : null;
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
      const history = historyExists;
      history.id = shortUUID.generate();
      history.groupId = groupId;
      history.group_content.push({
        id: shortUUID.generate(),
        content,
        role,
      });

      await redis.set(`tg-history:${groupId}`, JSON.stringify(history));
      await redis.expire(`tg-history:${groupId}`, 60 * 4); // 4 hours
      return history.group_content;
    } else {
      const hId = shortUUID.generate();
      const history = {
        id: hId,
        groupId,
        group_content: [
          {
            id: shortUUID.generate(),
            content,
            role,
          },
        ],
      };

      await redis.set(`tg-history:${groupId}`, JSON.stringify(history));
      await redis.expire(`tg-history:${groupId}`, 60 * 24); // 24 hours
    }
  }
}
