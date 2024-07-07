import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import prisma from "../prisma/prisma.js";
import CallLogsService from "../services/call-logs.service.js";
import AIService from "../services/AI.service.js";
import HttpException from "../lib/exception.js";
import logger from "../config/logger.js";
import shortUUID from "short-uuid";

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
        agent: {
          select: {
            type: true,
          },
        },
      },
    });

    if (!log) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Call log was not found.",
        404
      );
    }

    const sanitizeString = (str: string) => {
      return str?.replace(/\\(['"])/g, "$1").replace(/\\/g, "");
    };

    if (log.agent.type === "ANTI_THEFT") {
      let analysis = await this.aiService.determineATLogSentimentAnalysis(
        log.refId
      );

      const resp = analysis[0];

      if (!resp) {
        logger.error("No AI response was returned");
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Could not retrieve sentiment analysis. Try again later.",
          400
        );
      }
      if (analysis.length > 1) {
        logger.error("Incorrect AI response length was sent.");
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Could not retrieve sentiment analysis. Try again later.",
          400
        );
      }

      const validTypes = ["positive", "neutral", "negative"];
      const data = resp.args as any;
      const confidence = data?.confidence;
      const sentiment = sanitizeString(data?.sentiment);
      const suggested_action = sanitizeString(data?.suggested_action);
      let identified_red_flags = data?.identified_red_flags;
      const type = data?.type;

      if (!Array.isArray(identified_red_flags)) {
        identified_red_flags = null;
      }

      if (!validTypes.includes(type)) {
        logger.error(`Incorrect sentiment type: [${type}] returned.`);
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Could not retrieve sentiment analysis. Try again later.",
          400
        );
      }

      // save or update analysis
      const _analysis = await prisma.callLogsAnalysis.findFirst({
        where: { callLogId: logId },
      });

      if (_analysis) {
        logger.info("Updating call log analysis..");
        await prisma.callLogsAnalysis.update({
          where: { id: _analysis.id },
          data: {
            sentiment,
            confidence,
            suggested_action,
            red_flags:
              identified_red_flags !== null
                ? identified_red_flags.join(",")
                : identified_red_flags,
            type,
          },
        });
      } else {
        logger.info("Saving call log analysis..");
        await prisma.callLogsAnalysis.create({
          data: {
            id: shortUUID.generate(),
            callLogId: logId,
            sentiment,
            confidence,
            suggested_action,
            red_flags:
              identified_red_flags !== null
                ? identified_red_flags.join(",")
                : identified_red_flags,
            type,
          },
        });
      }

      sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Sentiment analysis retrieved successfully.",
        200,
        {
          type,
          sentiment,
          confidence,
          suggested_action,
          red_flags: identified_red_flags,
        }
      );
    }
    if (log.agent.type === "SALES_ASSISTANT") {
      let analysis = await this.aiService.determineSALogSentimentAnalysis(
        log.refId
      );

      const resp = analysis[0];

      if (!resp) {
        logger.error("No AI response was returned");
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Could not retrieve sentiment analysis. Try again later.",
          400
        );
      }
      if (analysis.length > 1) {
        logger.error("Incorrect AI response length was sent.");
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Could not retrieve sentiment analysis. Try again later.",
          400
        );
      }

      const validTypes = ["positive", "neutral", "negative"];
      const data = resp.args as any;
      const confidence = data?.confidence;
      const sentiment = sanitizeString(data?.sentiment);
      const suggested_action = sanitizeString(data?.suggested_action);
      let identified_red_flags = data?.identified_red_flags;
      const type = data?.type;

      if (!Array.isArray(identified_red_flags)) {
        identified_red_flags = null;
      }

      if (!validTypes.includes(type)) {
        logger.error(`Incorrect sentiment type: [${type}] returned.`);
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Could not retrieve sentiment analysis. Try again later.",
          400
        );
      }

      // save or update analysis
      const _analysis = await prisma.callLogsAnalysis.findFirst({
        where: { callLogId: logId },
      });

      if (_analysis) {
        logger.info("Updating call log analysis..");
        await prisma.callLogsAnalysis.update({
          where: { id: _analysis.id },
          data: {
            sentiment,
            confidence,
            suggested_action,
            red_flags:
              identified_red_flags !== null
                ? identified_red_flags.join(",")
                : identified_red_flags,
            type,
          },
        });
      } else {
        logger.info("Saving call log analysis..");
        await prisma.callLogsAnalysis.create({
          data: {
            id: shortUUID.generate(),
            callLogId: logId,
            sentiment,
            confidence,
            suggested_action,
            red_flags:
              identified_red_flags !== null
                ? identified_red_flags.join(",")
                : identified_red_flags,
            type,
          },
        });
      }

      sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Sentiment analysis retrieved successfully.",
        200,
        {
          type,
          sentiment,
          confidence,
          suggested_action,
          red_flags: identified_red_flags,
        }
      );
    }
  }

  public async deleteCallLog(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const logId = req.params.id;

    const log = await prisma.callLogs.findFirst({
      where: {
        id: logId,
        userId,
      },
    });

    if (!log) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Call log was not found.",
        404
      );
    }

    // delete the messages first
    const deleteLogMsg = prisma.callLogsMessages.deleteMany({
      where: {
        call_log_id: logId,
      },
    });

    const deleteLog = prisma.callLogs.delete({
      where: {
        id: logId,
      },
    });

    await prisma.$transaction([deleteLogMsg, deleteLog]);

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Call log deleted successfully",
      200
    );
  }
}
