import env from "../config/env";
import twClient from "../config/twillio/twilio_client";

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

  async provisionNumber(phoneNumber: string) {
    // TODOS: provision number
    // 1. check what environment we are in, if in DEV,
    // then provision a test number (modify the number argument to actual twlio number I purchased so I don't get charged for it)
    // 2. Add that number to lists of purchased numbers. (make sure duplicates are not added)
    // 3. Save the Phone number SID that was returned in DB ( would be used later on)
  }

  async configureProvisionedNumber(phoneNumber: string) {
    // ref: https://help.twilio.com/articles/223135027-Configure-a-Twilio-Phone-Number-to-Receive-and-Respond-to-Voice-Calls
    // TODOS: configure provisioned number
    // 1. configure the number to forward calls to the main number
    // 2. configure the number to forward sms to the main number
    //* 3. Update the voice used (LATER)
    // 4. Add phone number to the list of purchased numbers
  }
}
