import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import { type AgentEnum, type AgentType } from "../types/index.js";
import ZodValidation from "../lib/zodValidation.js";
import {
  createAgentSchema,
  LinkPhoneNumberSchema,
  VerifyOTPCode,
  verifyUsPhoneSchema,
} from "../lib/schema_validation.js";
import HttpException from "../lib/exception.js";
import { formatPhoneNumber, validateUsNumber } from "../lib/utils.js";
import OTPManager from "../lib/otp-manager.js";
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma.js";

interface ICreateAG {
  name: string;
  type: AgentType;
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
    const payload = req.body as { otp: string; agentId: string };

    await ZodValidation(VerifyOTPCode, payload, req.serverUrl!);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agentId,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const otpcode = payload.otp;

    const otp = await this.otpManager.verifyOTP(user.id, otpcode);

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

    const { name, type } = payload;

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

    // prevent user from creating more than 1 ANTI_THEFT agent
    if (type === "ANTI_THEFT") {
      const antiTheftAgent = await prisma.agents.findFirst({
        where: {
          type: "ANTI_THEFT",
          userId: user.id,
        },
      });

      if (antiTheftAgent) {
        throw new HttpException(
          RESPONSE_CODE.DUPLICATE_ENTRY,
          "You can only have one Anti-theft agent",
          400
        );
      }
    }

    // create agent
    await prisma.agents.create({
      data: {
        id: shortUUID.generate(),
        name,
        type: type as AgentEnum,
        userId: user.id,
      },
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent created successfully",
      200
    );
  }

  async activateAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.query["id"];

    const agent = await prisma.agents.findFirst({
      where: {
        id: agentId as string,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    //! PERFORM SOME CHECKS BEFORE ACTIVATING AGENT
    // * AUTOMATED_CUSTOMER_SUPPORT
    /**
     * - contact number is available
     * - Check if user added at least one knowledge base
     *
     **/
    // * ANTI_THEFT
    /**
     * - Check if user linked at least one protected number
     *
     **/

    // * CHATBOT
    /**
     * - Check if user added at least one knowledge base
     *
     **/

    // activate agent
    // await prisma.agents.update({
    //   where: {
    //     id: agentId as string,
    //   },
    //   data: {
    //     activated: true
    //   },
    // });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent activated successfully",
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
        type: true,
        used_number: {
          select: {
            phone: true,
            dial_code: true,
            country: true,
            created_at: true,
          },
        },
        protected_numbers: {
          select: {
            id: true,
            phone: true,
            dial_code: true,
            country: true,
          },
        },
        agent_settings: true,
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
    const agentId = req.params["id"];
    const agent = await prisma.agents.findFirst({
      where: {
        AND: {
          id: agentId as string,
          userId: user.id,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
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

  async getAgentSettings(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.params["id"];
    const agentSettings = await prisma.agents.findFirst({
      where: {
        AND: {
          id: agentId as string,
          userId: user.id,
        },
      },
      select: {
        agent_settings: {
          select: {
            allow_handover: true,
            handover_condition: true,
            security_code: true,
          },
        },
      },
    });

    if (!agentSettings) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const settings = agentSettings.agent_settings;

    const formattedSettings = {
      allow_handover: settings?.allow_handover ?? false,
      handover_condition: settings?.handover_condition ?? null,
      security_code: settings?.security_code ?? null,
    };

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent settings retrieved successfully",
      200,
      formattedSettings
    );
  }

  async getUsedPhoneNumbers(req: Request & IReqObject, res: Response) {
    const user = req["user"];

    const usedNumbers = await prisma.usedPhoneNumbers.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        phone: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Used phone numbers retrieved successfully",
      200,
      usedNumbers
    );
  }

  // Link purchased phone number to agent
  async linkPhoneToAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as {
      purchased_phone_id: string;
      agentId: string;
    };

    await ZodValidation(LinkPhoneNumberSchema, payload, req.serverUrl!);

    // check if purchased phone number exists
    const phone = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        id: payload.purchased_phone_id,
        userId: user.id,
      },
    });

    if (!phone) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Phone number not found",
        404
      );
    }

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agentId,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if phone number has been linked to an agent
    const linkedPhone = await prisma.usedPhoneNumbers.findFirst({
      where: {
        phone: phone.phone,
      },
    });

    if (linkedPhone) {
      throw new HttpException(
        RESPONSE_CODE.DUPLICATE_ENTRY,
        "Phone number already linked to an agent",
        400
      );
    }

    // link phone number to agent
    // Add phone number to used phone numbers
    await prisma.usedPhoneNumbers.create({
      data: {
        phone: phone.phone,
        userId: user.id,
        agentId: agent.id,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Phone number linked to agent successfully",
      200
    );
  }
}
