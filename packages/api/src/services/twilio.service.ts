import HttpException from "../lib/exception.js";
import env from "../config/env.js";
import twClient from "../config/twillio/twilio_client.js";
import prisma from "../prisma/prisma.js";
import { RESPONSE_CODE } from "../types/index.js";

interface IncomingCallParams {}

interface ProvisioningPhoneNumberProps {
  user_id: string;
  subscription_id: string;
  phone_number: string;
}

export class TwilioService {
  constructor() {}

  // send sms
  async sendSMS(to: string, body: string) {
    try {
      const msg = await twClient.messages.create({
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

  static async getAvailableNumbersForPurchase(country?: string) {
    try {
      const numbers = await twClient
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
      const phonePrice = await twClient.pricing.v1.phoneNumbers
        .countries(country)
        .fetch();
      return phonePrice;
    } catch (e: any) {
      console.log("error", e);
      return null;
    }
  }

  async handleIncomingCall(props: IncomingCallParams) {}

  static async findPhoneNumber(phoneNumber: string) {
    try {
      const number = await twClient.availablePhoneNumbers("US").local.list({
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
  static async provisionPhoneNumber(props: ProvisioningPhoneNumberProps) {
    const { subscription_id, user_id, phone_number } = props;

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

    // provision phone number
  }
}
