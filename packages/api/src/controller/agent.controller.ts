import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE, IReqObject } from "../types";
import ZodValidation from "../lib/zodValidation";
import {
  createWorkspaceSchema,
  VerifyOTPCode,
  verifyUsPhoneSchema,
} from "../lib/schema_validation";
import HttpException from "../lib/exception";
import { formatPhoneNumber, validateUsNumber } from "../lib/utils";
import OTPManager from "lib/otp-manager";
import shortUUID from "short-uuid";

interface ICreateAG {
  name: string;
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
    const phoneexists = await prisma.verifiedPhoneNumbers.findFirst({
      where: {
        phone: otp.phone,
        userId: user.id,
      },
    });

    if (phoneexists) {
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
    // await ZodValidation(createWorkspaceSchema, payload, req.serverUrl!);
  }

  async getAgents(req: Request & IReqObject, res: Response) {
    const user = req["user"];
  }
}
