import env from "../config/env.js";
import twClient from "../config/twillio/twilio_client.js";

interface IncomingCallParams {}

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

  async getAvailableNumbersForPurchase(country?: string) {
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

  async handleIncomingCall(props: IncomingCallParams) {}
}
