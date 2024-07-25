import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import { type AgentEnum, type AgentType } from "../types/index.js";
import ZodValidation from "../lib/zodValidation.js";
import {
  addIntegrationSchema,
  createAgentSchema,
  LinkPhoneNumberSchema,
  updateAgentSettingsSchema,
  updateChatBotConfigSchema,
  VerifyOTPCode,
  verifyUsPhoneSchema,
} from "../lib/schema_validation.js";
import HttpException from "../lib/exception.js";
import { formatPhoneNumber, validateUsNumber } from "../lib/utils.js";
import OTPManager from "../lib/otp-manager.js";
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma.js";
import { TwilioService } from "../services/twilio.service.js";
import redis from "../config/redis.js";
import type { IntegrationType } from "@prisma/client";
import LemonsqueezyServices from "../services/LS.service.js";
import retry from "async-retry";
import { integrations } from "googleapis/build/src/apis/integrations/index.js";

interface ICreateAG {
  name: string;
  type: AgentType;
}

interface IUpdateAgentSettings {
  allow_handover: boolean;
  handover_condition: "emergency" | "help";
  security_code: string;
  agent_id: string;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default class AgentController extends BaseController {
  otpManager = new OTPManager();
  twService = new TwilioService();
  lsService = new LemonsqueezyServices();
  constructor() {
    super();
  }

  async sendOTP(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agent_id = req.params["agent_id"];
    const payload = req.body as { phone: string };

    await ZodValidation(verifyUsPhoneSchema, payload, req.serverUrl!);

    const fwdNum = await prisma.forwardingNumber.findFirst({
      where: {
        phone: payload.phone,
        agentId: agent_id,
      },
    });

    if (fwdNum) {
      throw new HttpException(
        RESPONSE_CODE.DUPLICATE_ENTRY,
        "Phone number already in use",
        400
      );
    }

    const otpSent = await this.otpManager.sendOTP(payload.phone, user.id);

    if (!otpSent) {
      throw new HttpException(
        RESPONSE_CODE.OTP_FAILED,
        "Failed to send OTP",
        400
      );
    }

    const ip = req.ip;
    const key = `rate-limit:${ip}`;

    await redis.set(key, user.id);
    await redis.expire(key, 20);

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "OTP sent successfully",
      200
    );
  }

  async getForwardedNumber(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.params["agent_id"];

    if (!agentId) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Agent ID is required",
        400
      );
    }

    const fwdNum = await prisma.forwardingNumber.findFirst({
      where: {
        agentId: agentId as string,
      },
      select: {
        phone: true,
        country: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Forwarded number retrieved successfully",
      200,
      fwdNum
    );
  }

  async verifyPhone(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as { otp: string; agentId: string };

    await ZodValidation(VerifyOTPCode, payload, req.serverUrl!);

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

    const forwardingNum = await prisma.forwardingNumber.findFirst({
      where: {
        agentId: payload.agentId,
      },
    });

    if (!forwardingNum) {
      await prisma.forwardingNumber.create({
        data: {
          phone: otp.phone,
          agentId: payload.agentId,
          country: "US",
        },
      });
    } else {
      await prisma.forwardingNumber.update({
        where: {
          id: forwardingNum.id,
        },
        data: {
          phone: otp.phone,
          agentId: payload.agentId,
          country: "US",
        },
      });
    }

    await redis.del(user.id);

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

    // create agent
    const agentId = shortUUID.generate();

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

    if (type === "CHATBOT") {
      // add default chat config
      await prisma.chatbotConfig.create({
        data: {
          id: shortUUID.generate(),
          agentId,
          logo: null,
          brand_color: "#000",
          text_color: "#fff",
          welcome_message: `Hi, i'm ${payload.name}. How can I help you?`,
          brand_name: payload.name,
        },
      });
    }

    await prisma.agents.create({
      data: {
        id: agentId,
        name,
        type: type as AgentEnum,
        userId: user.id,
      },
    });

    // create default settings
    await prisma.agentSettings.create({
      data: {
        agentId,
        allow_handover: false,
        security_code: "",
        handover_condition: "emergency",
      },
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent created successfully",
      200
    );
  }

  async deleteAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.params["id"];

    const agent = await prisma.agents.findFirst({
      where: {
        id: agentId,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const purchasedNumber = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        userId: user.id,
        agent_id: agentId,
      },
    });

    if (process.env.NODE_ENV !== "development") {
      const phoneSID = purchasedNumber?.phone_number_sid;
      if (phoneSID) {
        const deleted = await this.twService.releasePhoneNumber(phoneSID);
        if (deleted) console.log("✅ Phone number released successfully");
        else console.log("❌ Error releasing phone number");
      } else console.log("No phone number to release.");
    }

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        subscription_id: purchasedNumber?.sub_id,
      },
    });

    if (subscription) {
      await retry(
        async () =>
          await this.lsService.cancelSubscription(subscription.subscription_id),
        {
          maxTimeout: 1000,
          retries: 3,
          onRetry: (err, attempt) => {
            console.log("❌ Error canceling subscription");
            console.log(`Attempt ${attempt} failed: ${err}`);
          },
        }
      );
    } else {
      console.log("No subscription to cancel.");
    }

    await sleep(4000);

    await prisma.agents.delete({
      where: {
        id: agentId,
      },
    });

    sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent deleted successfully",
      200
    );
  }

  async getChatbotConfig(req: Request & IReqObject, res: Response) {
    const agentId = req.params["id"];

    const chatbotConfig = await prisma.chatbotConfig.findFirst({
      where: {
        agentId,
      },
    });

    if (!chatbotConfig) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Chatbot config not found",
        404
      );
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Chatbot config retrieved successfully",
      200,
      chatbotConfig
    );
  }

  async updateChatbotConfig(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as {
      agentId: string;
      logo: string;
      brand_color: string;
      text_color: string;
      welcome_message: string;
      brand_name: string;
      suggested_questions: string;
    };

    const {
      agentId,
      logo,
      brand_color,
      text_color,
      welcome_message,
      brand_name,
      suggested_questions,
    } = payload;

    await ZodValidation(updateChatBotConfigSchema, payload, req.serverUrl!);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: agentId,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if chatbot config exists
    const chatbotConfig = await prisma.chatbotConfig.findFirst({
      where: {
        agentId,
      },
    });

    if (!chatbotConfig) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Chatbot config not found",
        404
      );
    }

    // update chatbot config
    await prisma.chatbotConfig.update({
      where: {
        id: chatbotConfig.id,
      },
      data: {
        logo,
        brand_color,
        text_color,
        welcome_message,
        brand_name,
        suggested_questions,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Chatbot config updated successfully",
      200
    );
  }

  private async forwardedNumberExists(agent_id: string) {
    const forwardedNumber = await prisma.forwardingNumber.findFirst({
      where: {
        agentId: agent_id as string,
      },
    });

    if (!forwardedNumber) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Forwarded number is required",
        400
      );
    }
  }

  async activateAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.params["id"];

    const agent = await prisma.agents.findFirst({
      where: {
        id: agentId as string,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    if (agent.type === "SALES_ASSISTANT") {
      const purchasedNumber = await prisma.purchasedPhoneNumbers.findFirst({
        where: {
          userId: user.id,
          agent_id: agentId as string,
        },
      });

      if (!purchasedNumber) {
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Buy a number to activate agent",
          400
        );
      }

      await this.forwardedNumberExists(agentId);

      const linkedKB = await prisma.linkedKnowledgeBase.findFirst({
        where: {
          agentId,
        },
        select: {
          kb: true,
        },
      });

      if (!linkedKB || linkedKB.kb.userId !== user.id) {
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Link or Add at least one knowledge base",
          400
        );
      }

      await prisma.agents.update({
        where: {
          id: agentId as string,
        },
        data: {
          activated: true,
        },
      });

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Agent activated successfully",
        200
      );
    }
    if (agent.type === "ANTI_THEFT") {
      const purchasedNumber = await prisma.purchasedPhoneNumbers.findFirst({
        where: {
          userId: user.id,
          agent_id: agentId as string,
        },
      });

      if (!purchasedNumber) {
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Buy a number to activate agent",
          400
        );
      }

      await this.forwardedNumberExists(agentId);

      await prisma.agents.update({
        where: {
          id: agentId as string,
        },
        data: {
          activated: true,
        },
      });

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Agent activated successfully",
        200
      );
    }
    if (agent.type === "CHATBOT") {
      const linkedKB = await prisma.linkedKnowledgeBase.findFirst({
        where: {
          agentId,
        },
        select: {
          kb: true,
        },
      });

      if (!linkedKB || linkedKB.kb.userId !== user.id) {
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Link or Add at least one knowledge base",
          400
        );
      }

      await prisma.agents.update({
        where: {
          id: agentId as string,
        },
        data: {
          activated: true,
        },
      });

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Agent activated successfully",
        200
      );
    }
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
        integrations: {
          select: {
            type: true,
            url: true,
          },
        },
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agents retrieved successfully",
      200,
      agents.map((a) => {
        return {
          ...a,
          integrations: a.integrations.length,
        };
      })
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
        activated: true,
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
        activated: true,
        purchased_number: {
          select: {
            phone: true,
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
      activated: agentSettings.activated,
      purchased_number: agentSettings.purchased_number,
    };

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent settings retrieved successfully",
      200,
      formattedSettings
    );
  }

  async getSubscription(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const agentId = req.params["agent_id"];

    const agent = await prisma.agents.findFirst({
      where: {
        id: agentId,
        userId,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const purchasedNumber = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        userId,
        agent_id: agentId,
      },
    });

    if (!purchasedNumber) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Subscription not found",
        404
      );
    }

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        subscription_id: purchasedNumber.sub_id,
        type: "TWILIO_PHONE_NUMBERS",
      },
      select: {
        status: true,
        renews_at: true,
        ends_at: true,
        product_id: true,
        subscription_id: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Subscription retrieved successfully",
      200,
      {
        id: subscription.subscription_id,
        ...subscription,
      }
    );
  }

  async getCustomerPortal(req: Request & IReqObject, res: Response) {
    const sub_id = req.params["sub_id"];

    const subscription = await prisma.subscriptions.findFirst({
      where: { subscription_id: sub_id, uId: req.user.id },
    });

    if (!subscription) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Subscription not found",
        404
      );
    }

    const url = await this.lsService.getCustomerPortalUrl(
      subscription.customer_id as string
    );

    if (!url) {
      throw new HttpException(
        RESPONSE_CODE.ERROR,
        "Error getting customer portal url",
        400
      );
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      url
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
        country: true,
        dial_code: true,
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

  async getActiveAgentNumber(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const agentId = req.params["id"];

    const purchasedNumber = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        userId: user.id,
        agent_id: agentId,
        is_deleted: false,
      },
      select: {
        id: true,
        phone: true,
        country: true,
        sub_id: true,
      },
    });

    let subscription;
    if (purchasedNumber) {
      subscription = await prisma.subscriptions.findFirst({
        where: {
          subscription_id: purchasedNumber.sub_id,
          is_deleted: false,
        },
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Active agent phone number retrieved successfully",
      200,
      purchasedNumber && subscription
        ? {
            phone: purchasedNumber?.phone,
            country: purchasedNumber?.country,
            subscription: {
              renews_at: subscription?.renews_at,
              ends_at: subscription?.ends_at,
              status: subscription?.status,
              variant: subscription.variant_name,
            },
          }
        : null
    );
  }

  async updateAgentSettings(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const payload = req.body as IUpdateAgentSettings;

    await ZodValidation(updateAgentSettingsSchema, payload, req.serverUrl);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agent_id,
        userId: user.id,
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

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if handover condition is valid
    const validCondition = ["emergency", "help"];

    if (
      payload?.handover_condition === "emergency" &&
      !payload?.security_code
    ) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Security code is needed.",
        404
      );
    }

    if (
      payload?.handover_condition &&
      !validCondition.includes(payload?.handover_condition)
    ) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_HANDOVER_CONDITION,
        "Handover condition is invalid",
        404
      );
    }

    // update
    const agentSettingsAvailable = await prisma.agentSettings.findFirst({
      where: {
        agentId: payload.agent_id,
      },
    });

    if (agentSettingsAvailable) {
      await prisma.agentSettings.update({
        where: {
          agentId: payload.agent_id,
        },
        data: {
          allow_handover:
            payload?.allow_handover ?? agent.agent_settings?.allow_handover,
          security_code:
            payload?.security_code ?? agent.agent_settings?.security_code,
          handover_condition:
            payload?.handover_condition ??
            agent.agent_settings?.handover_condition,
        },
      });
    } else {
      await prisma.agentSettings.create({
        data: {
          agentId: payload.agent_id,
          allow_handover:
            payload?.allow_handover ?? agent.agent_settings?.allow_handover,
          security_code:
            payload?.security_code ?? agent.agent_settings?.security_code,
          handover_condition:
            payload?.handover_condition ??
            agent.agent_settings?.handover_condition,
        },
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Agent settings updated successfully",
      200
    );
  }

  async getTwilioAvailableNumber(req: Request & IReqObject, res: Response) {
    const availableNumbers =
      await this.twService.getAvailableNumbersForPurchase("US");

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Available numbers retrieved successfully",
      200,
      availableNumbers
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

  async addIntegration(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as {
      agent_id: string;
      type: IntegrationType;
      url: string;
    };

    await ZodValidation(addIntegrationSchema, payload, req.serverUrl!);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agent_id,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if integration already exists
    const integration = await prisma.integration.findFirst({
      where: {
        agent_id: payload.agent_id,
        type: payload.type as IntegrationType,
      },
    });

    if (integration) {
      throw new HttpException(
        RESPONSE_CODE.DUPLICATE_ENTRY,
        "Integration already exists",
        400
      );
    }

    if (payload.type === "google_calendar") {
      const url = new URL(payload.url);
      if (url.hostname !== "calendar.app.google") {
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "Invalid Google calendar URL",
          400
        );
      }
    }

    let telegramIntegration = null;
    if (payload.type === "telegram") {
      const regularUUID = shortUUID.uuid();
      const translator = shortUUID();
      const authToken = translator.fromUUID(regularUUID);
      const integrationId = shortUUID.generate();
      telegramIntegration = await prisma.integration.create({
        data: {
          id: integrationId,
          agent_id: payload.agent_id,
          type: payload.type as IntegrationType,
          tg_config: {
            create: {
              id: shortUUID.generate(),
              auth_token: authToken,
            },
          },
        },
      });
    } else {
      await prisma.integration.create({
        data: {
          agent_id: payload.agent_id,
          type: payload.type as IntegrationType,
          url: payload.url,
        },
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Integration added successfully",
      200,
      telegramIntegration
    );
  }

  async getIntegration(req: Request & IReqObject, res: Response) {
    const agentId = req.params["agent_id"];

    const integration = await prisma.integration.findMany({
      where: {
        agent_id: agentId,
      },
      select: {
        id: true,
        type: true,
        url: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Integration retrieved successfully",
      200,
      integration
    );
  }

  async getIntegrationConfiguration(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const int_id = req.params["int_id"];
    const agent_id = req.params["agent_id"];

    if (!int_id || !agent_id) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "One or more required parameters are missing: int_id, type, agent_id",
        400
      );
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: int_id,
        agent_id,
        agents: {
          userId: user.id,
        },
      },
    });

    if (!integration) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Integration not found",
        404
      );
    }

    if (integration.type === "telegram") {
      const config = await prisma.telegramIntConfig.findFirst({
        where: {
          intId: int_id,
        },
        include: {
          groups: true,
        },
      });

      const formattedConfig = {
        id: config?.id,
        auth_token: config?.auth_token,
        created_at: config?.created_at,
        groups: config.groups.map((group) => {
          return {
            id: group.group_id,
            name: group.group_name,
          };
        }),
      };

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Integration configuration retrieved successfully",
        200,
        {
          telegram: formattedConfig,
        }
      );
    }
  }

  async rotateIntegrationToken(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const int_id = req.params["int_id"];
    const agent_id = req.params["agent_id"];

    if (!int_id || !agent_id) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "One or more required parameters are missing: int_id, type, agent_id",
        400
      );
    }

    const integration = await prisma.integration.findFirst({
      where: {
        id: int_id,
        agent_id,
        agents: {
          userId: user.id,
        },
      },
    });

    if (!integration) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Integration not found",
        404
      );
    }

    if (integration.type === "telegram") {
      const config = await prisma.telegramIntConfig.findFirst({
        where: {
          intId: int_id,
        },
      });

      if (!config) {
        throw new HttpException(
          RESPONSE_CODE.NOT_FOUND,
          "Integration configuration not found",
          404
        );
      }

      const regularUUID = shortUUID.uuid();
      const translator = shortUUID();
      const authToken = translator.fromUUID(regularUUID);

      const updateConfig = prisma.telegramIntConfig.update({
        where: {
          id: config.id,
        },
        data: {
          auth_token: authToken,
        },
      });

      // delete all groups
      const deleteBotGroups = prisma.telegramBotGroups.deleteMany({
        where: {
          tgIntConfigId: config.id,
        },
      });

      await prisma.$transaction([updateConfig, deleteBotGroups]);

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Integration token rotated successfully",
        200,
        {
          newToken: authToken,
        }
      );
    } else {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Invalid integration type",
        400
      );
    }
  }

  async removeIntegration(req: Request & IReqObject, res: Response) {
    const agentId = req.params["agent_id"];
    const intId = req.params["int_id"];

    const integration = await prisma.integration.findFirst({
      where: {
        id: intId,
        agent_id: agentId,
      },
    });

    if (!integration) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Integration not found",
        404
      );
    }

    await prisma.integration.delete({
      where: {
        id: integration.id,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Integration removed successfully",
      200
    );
  }
}
