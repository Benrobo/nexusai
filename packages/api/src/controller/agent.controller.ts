import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE, IReqObject, type AgentType } from "../types";
import ZodValidation from "../lib/zodValidation";
import {
  createAgentSchema,
  VerifyOTPCode,
  verifyUsPhoneSchema,
} from "../lib/schema_validation";
import HttpException from "../lib/exception";
import {
  countryExists,
  formatPhoneNumber,
  validateUsNumber,
} from "../lib/utils";
import OTPManager from "lib/otp-manager";
import shortUUID from "short-uuid";

interface ICreateAG {
  name: string;
  phone: string;
  type: AgentType;
  country: string;
}

export default class AgentController extends BaseController {
  otpManager = new OTPManager();
  constructor() {
    super();
  }

  async sendOTPToPhone(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as { phone: string };

    await ZodValidation(verifyUsPhoneSchema, payload, req.serverUrl!);

    const phone = formatPhoneNumber(payload.phone);

    if (!validateUsNumber(phone)) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Invalid phone number",
        400
      );
    }

    // send OTP to phone number
    const otpSent = await this.otpManager.sendOTPToPhone(phone, user.id);

    if (!otpSent) {
      throw new HttpException(
        RESPONSE_CODE.OTP_FAILED,
        "Failed to send OTP",
        400
      );
    }

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "OTP sent successfully",
      200
    );
  }

  // make sure phone number starts with +1 for US.
  async verifyPhone(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as { otp: string };

    await ZodValidation(VerifyOTPCode, payload, req.serverUrl!);

    const otpcode = payload.otp;

    const otp = await this.otpManager.verifyOTP(user.id, otpcode);

    // store verified phone number in db
    const phoneExists = await prisma.verifiedPhoneNumbers.findFirst({
      where: {
        phone: otp.phone,
        userId: user.id,
      },
    });

    if (phoneExists) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Phone number already verified",
        400
      );
    }

    await prisma.verifiedPhoneNumbers.create({
      data: {
        id: shortUUID.generate(),
        phone: otp.phone,
        users: {
          connect: { uId: user.id },
        },
      },
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Phone number verified",
      200,
      otp
    );
  }

  async createAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as ICreateAG;
    await ZodValidation(createAgentSchema, payload, req.serverUrl!);

    const { country, name, phone, type } = payload;

    // check if country exists among supported countries
    const _countryExists = countryExists(country);
    if (!_countryExists) {
      throw new HttpException(
        RESPONSE_CODE.UNSUPPORTED_COUNTRY,
        "Country provided isn't supported",
        400
      );
    }

    // check if phone number is among verified phone numbers
    const phoneExists = await prisma.verifiedPhoneNumbers.findFirst({
      where: {
        phone,
        userId: user.id,
      },
    });

    if (!phoneExists) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Phone number not verified",
        400
      );
    }

    // check if agent already exists
    const agentExists = await prisma.agents.findFirst({
      where: {
        name: name,
        userId: user.id,
      },
    });

    if (agentExists) {
      throw new HttpException(
        RESPONSE_CODE.DUPLICATE_ENTRY,
        "Agent already exists, please use a different name",
        400
      );
    }

    // check if other agents of type (anti-scam and automated-customer-support)
    // uses this same number
    const agentWithSamePhone = await prisma.agents.findFirst({
      where: {
        userId: user.id,
        phonenumber: phone,
        type,
      },
    });

    if (agentWithSamePhone) {
      throw new HttpException(
        RESPONSE_CODE.PHONE_NUMBER_IN_USE,
        "Phonenumber already in use by another agent.",
        400
      );
    }

    // create agent
    const agent = await prisma.agents.create({
      data: {
        id: shortUUID.generate(),
        name,
        phonenumber: phone,
        type,
        country,
        dial_code: _countryExists.dial_code,
        users: {
          connect: { uId: user.id },
        },
      },
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent created successfully",
      200,
      agent
    );
  }

  async getAgents(req: Request & IReqObject, res: Response) {
    const user = req["user"];
  }
}
