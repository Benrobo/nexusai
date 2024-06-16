import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import LemonsqueezyServices from "../services/LS.service.js";

export default class CheckoutController extends BaseController {
  constructor() {
    super();
  }

  async createTwPhoneCheckout(req: Request & IReqObject, res: Response) {
    const user = req["user"] as any;

    const checkUrl = await LemonsqueezyServices.createTwSubCheckout({
      user_id: user.id,
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Checkout created successfully",
      200,
      {
        url: checkUrl.data.url,
      }
    );
  }
}
