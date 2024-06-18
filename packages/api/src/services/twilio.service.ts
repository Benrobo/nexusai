import { Response } from "express";
import HttpException from "../lib/exception.js";
import env from "../config/env.js";
import twClient from "../config/twillio/twilio_client.js";
import prisma from "../prisma/prisma.js";
import {
  RESPONSE_CODE,
  type AgentType,
  type TwilioIncomingCallVoiceResponse,
} from "../types/index.js";
import dotenv from "dotenv";
import logger from "../config/logger.js";
import { twimlPrompt } from "../data/twilio/prompt.js";
import { sendXMLResponse } from "../helpers/twilio.helper.js";
import VoiceResponse from "twilio/lib/twiml/VoiceResponse.js";

dotenv.config();

interface IncomingCallParams extends TwilioIncomingCallVoiceResponse {}

interface InitConvRestProps {
  agent_type: AgentType;
  agent_id: string;
  user_id: string;
  caller: string;
}

interface ProvisioningPhoneNumberProps {
  user_id: string;
  subscription_id: string;
  phone_number: string;
  agent_id: string;
}

/**
 * Note: TwiMl instance is being used multiple times in the class to prevent stack response.
 */

export class TwilioService {
  prod_tw_client = twClient(env.TWILIO.ACCT_SID, env.TWILIO.AUTH_TOKEN);
  test_tw_client = twClient(
    env.TWILIO.TEST_ACCT_SID,
    env.TWILIO.TEST_AUTH_TOKEN
  );

  constructor() {}

  // INCOMING CALLS
  async handleIncomingCall(body: IncomingCallParams, res: Response) {
    const { To, Caller, CallerCountry, CalledState, CallStatus } = body;
    const twiml = new VoiceResponse();

    // check if "TO" phone is in db.
    const calledPhone = await prisma.purchasedPhoneNumbers.findFirst({
      where: {
        phone: To,
      },
      include: {
        users: {
          select: {
            uId: true,
            agents: true,
          },
        },
      },
    });

    if (!calledPhone) {
      logger.error(`Phone number ${To ?? ""} not found in database`);

      // return twiml response
      const prompt = twimlPrompt.find(
        (p) => p.type === "CALLED_PHONE_NOT_FOUND"
      );

      twiml.say(prompt.msg);
      twiml.hangup();

      const xml = twiml.toString();

      sendXMLResponse(res, xml);
      return;
    }

    // check if user has agents
    if (!calledPhone.users?.agents || calledPhone.users?.agents.length === 0) {
      logger.error(`User ${calledPhone.users?.uId} has no agents`);

      // return twiml response
      const prompt = twimlPrompt.find((p) => p.type === "NO_AGENT_AVAILABLE");

      twiml.say(prompt.msg);
      twiml.hangup();

      const xml = twiml.toString();

      sendXMLResponse(res, xml);
      return;
    }

    // check if agent is activated
    const activeAgents = calledPhone.users?.agents.filter((a) => a.activated);

    if (!activeAgents || activeAgents.length === 0) {
      logger.error(
        `User ${calledPhone.users?.uId} has no active agents [INACTIVE_AGENT]`
      );

      // return twiml response
      const prompt = twimlPrompt.find((p) => p.type === "INACTIVE_AGENT");

      twiml.say(prompt.msg);
      twiml.hangup();

      const xml = twiml.toString();

      sendXMLResponse(res, xml);
      return;
    }

    // check if phone is linked to an agent
    const agentLinked = await prisma.usedPhoneNumbers.findFirst({
      where: {
        phone: To,
      },
      select: {
        agentId: true,
        id: true,
      },
    });

    if (!agentLinked) {
      logger.error(`Phone number ${To} not linked to an agent`);

      // return twiml response
      const prompt = twimlPrompt.find((p) => p.type === "AGENT_NOT_LINKED");

      twiml.say(prompt.msg);
      twiml.hangup();

      const xml = twiml.toString();

      sendXMLResponse(res, xml);
      return;
    }

    // check if agent has knowledge base
    const agent = calledPhone.users?.agents.find(
      (a) => a.id === agentLinked.agentId
    );

    await this.initConversation(res, {
      agent_type: agent.type,
      agent_id: agent.id,
      user_id: calledPhone.users?.uId,
      caller: Caller,
    });
  }

  /**
   *
   * @param res express response object
   * @param rest agent_type, caller
   */
  private async initConversation(res: Response, rest: InitConvRestProps) {
    const { agent_type, user_id, agent_id, caller } = rest;
    const twiml = new VoiceResponse();

    if (agent_type === "ANTI_THEFT") {
      const prompt = twimlPrompt.find((p) => p.type === "INIT_ANTI_THEFT");

      twiml.say(prompt.msg);
      twiml.gather({
        input: ["speech"],
        action: `${env.TWILIO.WH_VOICE_URL}/process`,
        method: "POST",
        timeout: 3,
      });

      sendXMLResponse(res, twiml.toString());
    }

    if (agent_type === "AUTOMATED_CUSTOMER_SUPPORT") {
      // twiml.say("Hello Benaiah, how may I help you today?");
      // twiml.gather({
      //   input: ["speech"],
      //   action: `${env.TWILIO.WH_VOICE_URL}/process`,
      //   method: "POST",
      //   timeout: 3,
      // });
      // sendXMLResponse(res, twiml.toString());
    }
  }

  // CONTINUE CONVERSATION
  async processVoiceConversation(body: IncomingCallParams, res: Response) {
    const userInput = body["SpeechResult"] as any;
    const twiml = new VoiceResponse();

    // console.log("userInput", userInput);
    twiml.say("Hi Benaiah, how are you?");
    twiml.hangup();

    sendXMLResponse(res, twiml.toString());
  }

  // send sms
  async sendSMS(to: string, body: string) {
    try {
      const msg = await this.prod_tw_client.messages.create({
        body,
        to,
        from: env.TWILIO.PHONE_NUMBER,
      });

      return msg;
    } catch (error) {
      console.log("error", error);
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
  // Twilio Phone number Subscriptions
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
      phoneNumber: IN_DEV_MODE ? env.TWILIO.DEFAULT_PHONE_NUMBER : phone_number,
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
}
