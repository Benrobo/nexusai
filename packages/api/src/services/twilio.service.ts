import HttpException from "../lib/exception.js";
import env from "../config/env.js";
import twClient from "../config/twillio/twilio_client.js";
import prisma from "../prisma/prisma.js";
import { RESPONSE_CODE } from "../types/index.js";
import dotenv from "dotenv";
import logger from "../config/logger.js";

dotenv.config();

interface IncomingCallParams {}

interface ProvisioningPhoneNumberProps {
  user_id: string;
  subscription_id: string;
  phone_number: string;
}

export class TwilioService {
  prod_tw_client = twClient(env.TWILIO.ACCT_SID, env.TWILIO.AUTH_TOKEN);
  test_tw_client = twClient(
    env.TWILIO.TEST_ACCT_SID,
    env.TWILIO.TEST_AUTH_TOKEN
  );

  constructor() {}

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

  async handleIncomingCall(props: IncomingCallParams) {}

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
    const { subscription_id, user_id, phone_number } = props;
    const IN_DEV_MODE = process.env.NODE_ENV === "development";

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
      phoneNumber: IN_DEV_MODE ? env.TWILIO.ANTI_THEFT_NUMBER : phone_number,
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
        },
      });
    } else {
      // create
      logger.info(`Creating phone number ${phone_number} for user ${user_id}`);
      await prisma.purchasedPhoneNumbers.create({
        data: {
          userId: user_id,
          phone: phone_number,
          phone_number_sid: resp.sid,
          bundle_sid: resp.bundleSid,
        },
      });
    }

    logger.info(
      `✅ Phone number ${phone_number} provisioned for user ${user_id}`
    );
  }
}
