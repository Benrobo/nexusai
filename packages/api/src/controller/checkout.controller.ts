import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import LemonsqueezyServices from "../services/LS.service.js";
import ZodValidation from "../lib/zodValidation.js";
import { buyTwilioNumberSchema } from "../lib/schema_validation.js";
import redis from "../config/redis.js";
import HttpException from "../lib/exception.js";
import { TwilioService } from "../services/twilio.service.js";
import prisma from "../prisma/prisma.js";

interface IStoredPhoneData {
  phone_number: string;
  user_id: string;
  agent_id: string;
}

export default class CheckoutController extends BaseController {
  twService = new TwilioService();
  constructor() {
    super();
  }

  async buyTwilioNumber(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body;

    await ZodValidation(buyTwilioNumberSchema, payload, req.serverUrl);

    // check if this agent has a phone number linked
    const agentHasPhone = await prisma.usedPhoneNumbers.findFirst({
      where: {
        userId: user.id,
        agentId: payload.agent_id,
        phone: payload.phone_number,
      },
    });

    if (agentHasPhone) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        `Only one phone number can be purchased per agent.`,
        400
      );
    }

    // store phone number in cache for 5 minutes
    const phoneNumber = payload["phone_number"];
    const agent_id = payload["agent_id"];
    const uId = user.id;
    const expireTime = 60 * 20; // 10min

    // check if agent exists
    const agentExists = await prisma.agents.findFirst({
      where: {
        id: agent_id,
        userId: uId,
      },
    });

    if (!agentExists) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        `Agent not found. Return to "buy number page" and select a number.`,
        400
      );
    }

    // clear existing phone number
    await redis.del(uId);

    await redis.set(
      uId,
      JSON.stringify({
        phone_number: phoneNumber,
        user_id: uId,
        agent_id,
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

  // generate checkout url for twilio phone number
  async createTwPhoneCheckout(req: Request & IReqObject, res: Response) {
    const user = req["user"] as any;

    // get phone number from cache
    const phoneData = await redis.get(user.id);

    if (!phoneData || phoneData === null) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        `Phone number not found. Return to buy number page to select a number.`,
        400
      );
    }

    const storedData = JSON.parse(phoneData) as IStoredPhoneData;
    const { phone_number, agent_id } = storedData;

    // check if phone number exists among lists of available twilio numbers
    const phoneExists = await this.twService.findPhoneNumber(phone_number);

    if (!phoneExists || phoneExists.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        `Phone number not found. Return to "buy number page" and select a number.`,
        400
      );
    }

    const checkUrl = await LemonsqueezyServices.createTwSubCheckout({
      user_id: user.id,
      phone_number,
      agent_id: agent_id,
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
