import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import prisma from "../prisma/prisma.js";
import CallLogsService from "../services/call-logs.service.js";
import AIService from "../services/AI.service.js";
import HttpException from "../lib/exception.js";

export default class CallLogsController {
  private callLogsService = new CallLogsService();
  private aiService = new AIService();
  constructor() {}

  public async getCallLogs(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const query = req.query;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    const page = query.page ? parseInt(query.page as string) : 1;

    const logs = await this.callLogsService.getCallLogs(userId, {
      limit,
      page,
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Call logs fetched successfully",
      200,
      logs
    );
  }

  public async getUnreadLogs(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const unreadLogs = await this.callLogsService.getUnreadLogs(userId);

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Unread call logs fetched successfully",
      200,
      unreadLogs
    );
  }

  public async markLogAsRead(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const logId = req.params.id;

    await this.callLogsService.markLogAsRead(logId, userId);

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Call log marked as read",
      200
    );
  }

  public async getSentimentAnalysis(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const logId = req.params.id;

    const log = await prisma.callLogs.findFirst({
      where: {
        id: logId,
        userId,
      },
      select: {
        refId: true,
      },
    });

    if (!log) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Call log was not found.",
        404
      );
    }

    const analysis = await this.aiService.determineLogSentimentAnalysis(
      log.refId
    );
  }
}
