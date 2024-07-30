import { Response } from "express";
import HttpException from "../lib/exception.js";
import env from "../config/env.js";
import twClient from "../config/twillio/twilio_client.js";
import prisma from "../prisma/prisma.js";
import { RESPONSE_CODE } from "../types/index.js";
import dotenv from "dotenv";
import logger from "../config/logger.js";
import { twimlPrompt } from "../data/twilio/prompt.js";
import { sendXMLResponse } from "../helpers/twilio.helper.js";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";
import AIService from "./AI.service.js";
import redis from "../config/redis.js";
import type {
  ConvVoiceCallCacheInfo,
  ProvisioningPhoneNumberProps,
  IncomingCallParams,
  InitConvRestProps,
} from "../types/twilio-service.types.js";
import { defaultAgentName } from "../data/agent/config.js";
import defaultAgentVoices from "../data/agent/voice.js";
import PhraseService from "./phrase.service.js";

dotenv.config();

// Note: TwiMl instance is being used multiple times in the class to prevent stack response.

export class TwilioService {
  prod_tw_client = twClient(env.TWILIO.ACCT_SID, env.TWILIO.AUTH_TOKEN);
  test_tw_client = twClient(
    env.TWILIO.TEST_ACCT_SID,
    env.TWILIO.TEST_AUTH_TOKEN
  );
  aiService = new AIService();
  phraseService = new PhraseService();

  constructor() {}

  async handleIncomingCall(body: IncomingCallParams, res: Response) {
    const { To, Caller, CallSid } = body;
    const twiml = new VoiceResponse();

    try {
      // Combine database queries and use caching
      const [calledPhone, agentLinked] = await Promise.all([
        this.getCachedPhoneInfo(To),
        this.getCachedAgentLink(To),
      ]);

      if (!calledPhone) {
        logger.error(`Phone number ${To} not found in database`);
        return this.sendErrorResponse(res, twiml, "number-notfound");
      }

      if (!calledPhone.users?.agents || calledPhone.users.agents.length === 0) {
        logger.error(`No agents found for phone number ${To}`);
        return this.sendErrorResponse(res, twiml, "unable-to-assist");
      }

      const activeAgents = calledPhone.users.agents.filter((a) => a.activated);
      if (activeAgents.length === 0) {
        logger.error(`No active agents found for phone number ${To}`);
        return this.sendErrorResponse(res, twiml, "unable-to-assist");
      }

      if (!agentLinked) {
        logger.error(`Phone number ${To} not linked to any agent`);
        return this.sendErrorResponse(res, twiml, "unable-to-assist");
      }

      const agent = activeAgents.find((a) => a.id === agentLinked.agentId);
      if (!agent) {
        logger.error(`Agent not found for phone number ${To}`);
        return this.sendErrorResponse(res, twiml, "unable-to-assist");
      }

      await this.initConversation(res, {
        agent_type: agent?.type as any,
        agent_id: agent.id,
        user_id: calledPhone.users?.uId,
        caller: Caller,
        callSid: CallSid,
      });
    } catch (error) {
      logger.error("Error in handleIncomingCall:", error);
      return this.sendErrorResponse(res, twiml, "error-occurred");
    }
  }

  private async getCachedPhoneInfo(phone: string) {
    const cacheKey = `phone_info_${phone}`;
    let phoneInfo: {
      phone: string;
      users: {
        uId: string;
        agents: {
          id: string;
          type: string;
          activated: boolean;
        }[];
      };
    } | null = JSON.parse(await redis.get(cacheKey));

    if (!phoneInfo) {
      phoneInfo = await prisma.purchasedPhoneNumbers.findFirst({
        where: { phone },
        include: {
          users: {
            select: {
              uId: true,
              agents: true,
            },
          },
        },
      });
      if (phoneInfo) {
        await redis.set(cacheKey, JSON.stringify(phoneInfo), "EX", 3600); // Cache for 1 hour
      }
    } else {
      // phoneInfo = JSON.parse(phoneInfo);
    }

    return phoneInfo;
  }

  private async getCachedAgentLink(phone: string) {
    const cacheKey = `agent_link_${phone}`;
    let agentLink = JSON.parse(await redis.get(cacheKey));

    if (!agentLink) {
      agentLink = await prisma.usedPhoneNumbers.findFirst({
        where: { phone },
        select: {
          agentId: true,
          id: true,
        },
      });
      if (agentLink) {
        await redis.set(cacheKey, JSON.stringify(agentLink), "EX", 3600); // Cache for 1 hour
      }
    } else {
      agentLink = agentLink;
    }

    return agentLink;
  }

  private sendErrorResponse(
    res: Response,
    twiml: VoiceResponse,
    errorType: string
  ) {
    twiml.play(defaultAgentVoices.find((v) => v.type === errorType).path);
    twiml.hangup();
    return sendXMLResponse(res, twiml.toString());
  }

  /**
   *
   * @param res express response object
   * @param rest agent_type, caller
   */
  private async initConversation(res: Response, rest: InitConvRestProps) {
    const { agent_type, user_id, agent_id, callSid } = rest;
    const twiml = new VoiceResponse();
    const agent = await prisma.agents.findFirst({
      where: {
        id: agent_id,
      },
    });

    if (agent_type === "ANTI_THEFT") {
      const prompt = twimlPrompt.find((p) => p.type === "INIT_ANTI_THEFT");

      const audioUrl = await this.getAudioUrl(agent?.name, prompt.msg);
      twiml.play(audioUrl);
      twiml.gather({
        input: ["speech"],
        action: `${env.TWILIO.WH_VOICE_URL}/process/anti-theft`,
        method: "POST",
        timeout: 5,
        speechTimeout: "3",
        speechModel: "experimental_conversations",
        enhanced: true,
      });

      sendXMLResponse(res, twiml.toString());
    }

    if (agent_type === "SALES_ASSISTANT") {
      const prompt = twimlPrompt
        .find((p) => p.type === "INIT_SALES_ASSISTANT")
        .msg.replace("{{agent_name}}", agent?.name ?? defaultAgentName);

      const audioUrl = await this.getAudioUrl(agent?.name, prompt);

      twiml.play(audioUrl);
      twiml.gather({
        input: ["speech"],
        action: `${env.TWILIO.WH_VOICE_URL}/process/sales-assistant`,
        method: "POST",
        timeout: 5,
        speechTimeout: "3",
        speechModel: "experimental_conversations",
        enhanced: true,
      });

      sendXMLResponse(res, twiml.toString());
    }
  }

  private async getAudioUrl(agentName: string, prompt: string) {
    let audioUrl = await this.phraseService.retrievePhrase(agentName, prompt);

    if (!audioUrl) {
      audioUrl = await this.phraseService.storePhrase(prompt);
    }

    return audioUrl;
  }

  // ANTI-THEFT VOICE CALL PROCESSING
  async processVoiceATConversation(body: IncomingCallParams, res: Response) {
    const twiml = new VoiceResponse();
    try {
      const userInput = body["SpeechResult"];
      const callSid = body["CallSid"];
      const callerPhone = body.Caller;
      const calledPhone = body.Called;
      const callRefId = `${callerPhone}-${calledPhone}-${callSid}`;

      const agents = await prisma.agents.findMany({
        select: {
          used_number: {
            select: {
              agentId: true,
              phone: true,
            },
          },
          userId: true,
          name: true,
        },
      });
      const agent = agents
        .filter((a) => a.used_number !== null)
        .find((a) => a.used_number?.phone === calledPhone);
      const agentInfo = agent
        ? {
            agent_id: agent.used_number.agentId,
            user_id: agent.userId,
          }
        : null;

      let convCachedInfo: ConvVoiceCallCacheInfo = {
        callerPhone: callerPhone,
        calledPhone: calledPhone,
        callRefId,
        state: body.CallerState,
        country_code: body.CallerCountry,
        zipcode: body.CallerZip,
      };

      const conv = await this.aiService.handleConversation({
        user_input: userInput,
        agent_type: "ANTI_THEFT",
        agent_info: agentInfo,
        cached_conv_info: convCachedInfo,
      });

      const audioUrl = await this.getAudioUrl(agent?.name, conv.msg);

      if (conv.ended) {
        twiml.play(audioUrl);
        twiml.hangup();

        await redis.del(callRefId);
      } else {
        twiml
          .gather({
            input: ["speech"],
            action: `${env.TWILIO.WH_VOICE_URL}/process/anti-theft`,
            method: "POST",
            timeout: 5,
            speechTimeout: "auto",
          })
          .play(audioUrl);
      }
      sendXMLResponse(res, twiml.toString());
    } catch (e: any) {
      console.log(e);
      twiml.play(
        defaultAgentVoices.find((v) => v.type === "error-occurred").path
      );
      twiml.hangup();
      sendXMLResponse(res, twiml.toString());
    }
  }

  // SALES ASSISTANT VOICE CALL PROCESSING
  async processVoiceSAConversation(body: IncomingCallParams, res: Response) {
    const twiml = new VoiceResponse();
    try {
      const userInput = body["SpeechResult"];
      const callSid = body["CallSid"];
      const callerPhone = body.Caller;
      const calledPhone = body.Called;
      const callRefId = `${callerPhone}-${calledPhone}-${callSid}`;

      const agents = await prisma.agents.findMany({
        select: {
          used_number: {
            select: {
              agentId: true,
              phone: true,
            },
          },
          userId: true,
          name: true,
        },
      });

      const agent = agents
        .filter((a) => a.used_number !== null)
        .find((a) => a.used_number?.phone === calledPhone);
      const agentInfo = agent
        ? {
            agent_id: agent.used_number.agentId,
            user_id: agent.userId,
          }
        : null;

      const linkedKb = await prisma.linkedKnowledgeBase.findMany({
        where: {
          agentId: agentInfo?.agent_id,
        },
      });

      if (!linkedKb || linkedKb.length === 0) {
        twiml.play(
          defaultAgentVoices.find((v) => v.type === "datasource-notfound").path
        );
        twiml.hangup();
        sendXMLResponse(res, twiml.toString());
        return;
      }

      const convCachedInfo: ConvVoiceCallCacheInfo = {
        callerPhone: callerPhone,
        calledPhone: calledPhone,
        callRefId,
        state: body.CallerState,
        country_code: body.CallerCountry,
        zipcode: body.CallerZip,
        kb_ids: linkedKb.map((kb) => kb.kb_id),
      };

      const conv = await this.aiService.handleConversation({
        user_input: userInput,
        agent_type: "SALES_ASSISTANT",
        agent_info: agentInfo,
        cached_conv_info: convCachedInfo,
      });

      const audioUrl = await this.getAudioUrl(agent?.name, conv.msg);
      if (conv.ended) {
        twiml.play(audioUrl);
        twiml.hangup();

        await redis.del(callRefId);
      } else if (conv?.escallated?.number) {
        twiml.play(audioUrl);
        twiml.dial(conv.escallated.number);
      } else {
        console.log("gattering");
        twiml
          .gather({
            input: ["speech"],
            action: `${env.TWILIO.WH_VOICE_URL}/process/sales-assistant`,
            method: "POST",
            timeout: 5,
            speechTimeout: "auto",
          })
          .play(audioUrl!);
      }
      sendXMLResponse(res, twiml.toString());
    } catch (e: any) {
      console.log(e);
      twiml.play(
        defaultAgentVoices.find((v) => v.type === "error-occurred").path
      );
      twiml.hangup();
      sendXMLResponse(res, twiml.toString());
    }
  }

  // would use this later
  private async getCallDuration(callSid: string) {
    try {
      const call = await this.prod_tw_client.calls(callSid).fetch();
      return call.duration;
    } catch (e: any) {
      logger.error(`Error fetching call duration: ${e.message}`);
      console.log(e);
      return null;
    }
  }

  async getAvailableNumbersForPurchase(country?: string) {
    try {
      const numbers = await this.prod_tw_client
        .availablePhoneNumbers(country ?? "US")
        .local.list({
          limit: 20,
        });

      return numbers;
    } catch (e: any) {
      console.log("error", e);
      return null;
    }
  }

  async retrievePhonePrice(country: string = "US") {
    try {
      const phonePrice = await this.prod_tw_client.pricing.v1.phoneNumbers
        .countries(country)
        .fetch();
      return phonePrice;
    } catch (e: any) {
      console.log("error", e);
      return null;
    }
  }

  async findPhoneNumber(phoneNumber: string) {
    try {
      const number = await this.prod_tw_client
        .availablePhoneNumbers("US")
        .local.list({
          limit: 1,
          contains: phoneNumber,
        });
      return number;
    } catch (e: any) {
      console.log("error", e);
      return null;
    }
  }

  async provisionPhoneNumber(props: ProvisioningPhoneNumberProps) {
    const { subscription_id, user_id, phone_number, agent_id } = props;
    const IN_DEV_MODE = process.env.NODE_ENV === "development";

    // check if agent exists
    const agentExists = await prisma.agents.findFirst({
      where: {
        id: agent_id,
      },
    });

    if (!agentExists) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_PROVISIONING_NUMBER,
        `Error provisioning number. Agent not found. `,
        400
      );
    }

    // check if subscription exists with that user
    const subExists = await prisma.subscriptions.findFirst({
      where: {
        subscription_id,
        uId: user_id,
      },
    });

    if (!subExists) {
      throw new HttpException(
        RESPONSE_CODE.ERROR_PROVISIONING_NUMBER,
        `Error provisioning number. Invalid subscription. `,
        400
      );
    }

    // check the status of subscription if it has expired
    if (subExists.status === "expired") {
      throw new HttpException(
        RESPONSE_CODE.ERROR_PROVISIONING_NUMBER,
        `Error provisioning number. Subscription has expired. Renew subscription to provision number. `,
        400
      );
    }

    // In dev mode, use default Twilio number to get "in-use" status without charges.
    // which makes "bundle_sid" null in response

    const resp = await this.prod_tw_client.incomingPhoneNumbers.create({
      phoneNumber: IN_DEV_MODE
        ? env.TWILIO.DEFAULT_PHONE_NUMBER1
        : phone_number,
      voiceUrl: env.TWILIO.WH_VOICE_URL,
      friendlyName: phone_number,
      voiceMethod: "POST",
    });

    console.log("resp", resp);

    // check if user has a phone number already purchased
    const phoneExists = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        userId: user_id,
        phone: phone_number,
        agent_id,
      },
    });

    const usedPhoneNumberExists = await prisma.usedPhoneNumbers.findFirst({
      where: {
        agentId: agent_id,
        userId: user_id,
      },
    });

    if (phoneExists) {
      // update
      logger.info(`Updating phone number ${phone_number} for user ${user_id}`);
      await prisma.purchasedPhoneNumbers.update({
        where: {
          id: phoneExists.id,
          userId: user_id,
        },
        data: {
          phone: phone_number,
          phone_number_sid: resp.sid,
          bundle_sid: resp.bundleSid,
          sub_id: subscription_id,
          agent_id,
          country: "US",
        },
      });

      if (!usedPhoneNumberExists) {
        // link phone number to agent
        await prisma.usedPhoneNumbers.create({
          data: {
            agentId: agent_id,
            userId: user_id,
            phone: phone_number,
            country: "US",
          },
        });
      } else {
        // update
        await prisma.usedPhoneNumbers.update({
          where: {
            id: usedPhoneNumberExists.id,
          },
          data: {
            phone: phone_number,
            country: "US",
          },
        });
      }
    } else {
      // create
      logger.info(`Creating phone number ${phone_number} for user ${user_id}`);
      await prisma.purchasedPhoneNumbers.create({
        data: {
          userId: user_id,
          phone: phone_number,
          phone_number_sid: resp.sid,
          bundle_sid: resp.bundleSid,
          sub_id: subscription_id,
          agent_id,
          country: "US",
        },
      });

      if (!usedPhoneNumberExists) {
        // link phone number to agent
        await prisma.usedPhoneNumbers.create({
          data: {
            agentId: agent_id,
            userId: user_id,
            phone: phone_number,
            country: "US",
          },
        });
      } else {
        // update
        await prisma.usedPhoneNumbers.update({
          where: {
            id: usedPhoneNumberExists.id,
          },
          data: {
            phone: phone_number,
            country: "US",
          },
        });
      }
    }

    logger.info(
      `✅ Phone number ${phone_number} provisioned for user ${user_id}`
    );
  }

  async releasePhoneNumber(phoneNumberSID: string) {
    try {
      const IN_DEV_MODE = process.env.NODE_ENV === "development";
      const phone = IN_DEV_MODE
        ? this.test_tw_client.incomingPhoneNumbers(phoneNumberSID)
        : this.prod_tw_client.incomingPhoneNumbers(phoneNumberSID);
      await phone.remove();
      return true;
    } catch (e: any) {
      console.log("Error releasing phoneNumber", e);
      return false;
    }
  }
}
