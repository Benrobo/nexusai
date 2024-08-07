import { Request, Response } from "express";
import AIService from "./AI.service.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE } from "../types/index.js";
import prisma from "../prisma/prisma.js";
import HttpException from "../lib/exception.js";
import redis from "../config/redis.js";

type Payload = {
  agentId: string;
  userQuery: string;
  groupId: string;
  senderName: string;
};

export default class TelegramService {
  aiService = new AIService();
  public async handleAIResponse(req: Request, res: Response) {
    // * handle AI response
    const payload: Payload = req.body;

    console.log(payload);

    if (!payload.agentId || !payload.userQuery || !payload.groupId) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Missing required fields",
        400
      );
    }

    // check if agent exists and group exists within telegram groups
    const agent = await prisma.agents.findFirst({
      where: { id: payload.agentId },
      select: {
        integrations: {
          select: {
            tg_config: true,
            type: true,
          },
        },
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const tgIntegrationConfig = agent.integrations
      .filter((integration) => integration.type === "telegram")
      .find((integration) => integration.tg_config);

    if (!tgIntegrationConfig) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Telegram integration not found",
        404
      );
    }

    const group = await prisma.telegramBotGroups.findFirst({
      where: {
        group_id: payload.groupId,
        tgIntConfigId: tgIntegrationConfig.tg_config.id,
      },
    });

    if (!group) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Telegram group not found",
        404
      );
    }

    const aiResp = await this.aiService.handleTelegramCustomerSupportRequest({
      agentId: payload.agentId,
      userMessage: payload.userQuery,
      groupId: payload.groupId,
      senderName: payload.senderName,
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "AI response handled successfully",
      200,
      aiResp.data.aiResp
    );
  }
}
