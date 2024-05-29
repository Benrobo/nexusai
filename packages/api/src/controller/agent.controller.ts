import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE, IReqObject } from "../types";
import { type AgentEnum, type AgentType } from "@nexusai/shared/types";
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
import OTPManager from "../lib/otp-manager";
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma";
import { checkAgentPhoneNumInUse } from "helpers/agents.helper";

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

  async sendOTP(req: Request & IReqObject, res: Response) {
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
    const otpSent = await this.otpManager.sendOTP(phone, user.id);

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
    const agentWithSamePhone = await checkAgentPhoneNumInUse({
      phoneNumber: phone,
      type,
      userId: user.id,
    });

    if (agentWithSamePhone) {
      throw new HttpException(
        RESPONSE_CODE.PHONE_NUMBER_IN_USE,
        "Phonenumber already in use by another agent.",
        400
      );
    }

    // create agent
    if (["ANTI_THEFT", "AUTOMATED_CUSTOMER_SUPPORT"].includes(type)) {
      const agent = await prisma.agents.create({
        data: {
          id: shortUUID.generate(),
          name,
          contact_number: phone,
          type,
          country,
          dial_code: _countryExists.dial_code,
          users: {
            connect: { uId: user.id },
          },
        },
      });

      if (type === "ANTI_THEFT") {
        // add phone to list of protected numbers
        await prisma.agentProtectedNumbers.create({
          data: {
            id: shortUUID.generate(),
            agentId: agent.id,
            phone,
            country,
            dial_code: _countryExists.dial_code,
          },
        });
      }

      // update verified phone number to isInUse
      await prisma.verifiedPhoneNumbers.update({
        where: {
          userId: user.id,
          phone,
        },
        data: {
          isInUse: true,
        },
      });
    } else {
      // CHATBOT
      await prisma.agents.create({
        data: {
          id: shortUUID.generate(),
          name,
          type,
          country,
          users: {
            connect: { uId: user.id },
          },
        },
      });
    }

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent created successfully",
      200
    );
  }

  async getAgents(req: Request & IReqObject, res: Response) {
    const user = req["user"];

    const agents = await prisma.agents.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        contact_number: true,
        type: true,
        country: true,
        dial_code: true,
        protected_numbers: {
          select: {
            id: true,
            phone: true,
            dial_code: true,
            country: true,
          },
        },
        created_at: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agents retrieved successfully",
      200,
      agents
    );
  }

  async getAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.query["id"];

    const agent = await prisma.agents.findFirst({
      where: {
        id: agentId as string,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        contact_number: true,
        type: true,
        country: true,
        dial_code: true,
        protected_numbers: {
          select: {
            id: true,
            phone: true,
            dial_code: true,
            country: true,
          },
        },
        created_at: true,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent retrieved successfully",
      200,
      agent
    );
  }

  async getVerifiedNumbers(req: Request & IReqObject, res: Response) {
    const user = req["user"];

    const verifiedNumbers = await prisma.verifiedPhoneNumbers.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        isInUse: true,
        phone: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Verified numbers retrieved successfully",
      200,
      verifiedNumbers
    );
  }
}
