import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import LemonsqueezyServices from "../services/LS.service.js";
import ZodValidation from "../lib/zodValidation.js";
import { buyTwilioNumberSchema } from "../lib/schema_validation.js";
import redis from "../config/redis.js";
import HttpException from "../lib/exception.js";

export default class CheckoutController extends BaseController {
  constructor() {
    super();
  }

  async buyTwilioNumber(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body;

    await ZodValidation(buyTwilioNumberSchema, payload, req.serverUrl);

    // store phone number in cache for 5 minutes
    const phoneNumber = payload["phone_number"];
    const uId = user.id;
    const expireTime = 60 * 5;

    await redis.set(
      uId,
      JSON.stringify({
        phone_number: phoneNumber,
        user_id: uId,
      })
    );
    await redis.expireat(uId, Math.floor(Date.now() / 1000) + expireTime);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Phone number saved successfully",
      200,
      {
        number: phoneNumber,
      }
    );
  }

  async createTwPhoneCheckout(req: Request & IReqObject, res: Response) {
    const user = req["user"] as any;

    // get phone number from cache
    const phoneData = await redis.get(user.id);

    if (!phoneData) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        `Phone number not found. Return to buy number page to select a number.`,
        400
      );
    }

    const checkUrl = await LemonsqueezyServices.createTwSubCheckout({
      user_id: user.id,
      phone_number: JSON.parse(phoneData).phone_number,
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
