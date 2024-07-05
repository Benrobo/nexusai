import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import prisma from "../prisma/prisma.js";
import CallLogsService from "../services/call-logs.service.js";

export default class CallLogsController {
  private callLogsService = new CallLogsService();
  constructor() {}

  public async getCallLogs(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;

    const logs = await this.callLogsService.getCallLogs(userId);

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Call logs fetched successfully",
      200,
      logs
    );
  }
}
