import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";

export default class SubscriptionController extends BaseController {
  constructor() {
    super();
  }

  async createTwPhoneSu(req: Request & IReqObject, res: Response) {
    const user = req["user"] as any;
  }
}
