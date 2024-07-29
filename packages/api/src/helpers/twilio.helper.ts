import env from "../config/env.js";
import twClient from "../config/twillio/twilio_client.js";
import { Response } from "express";

// Twilio Helper Functions

export const sendXMLResponse = (res: Response, data: string) => {
  res.set("Content-Type", "text/xml");
  res.send(data);
  res.end();

  // log response
  console.log("\n");
  console.log(data);
  console.log("\n");
};

/**
 This was added here (/helper) to prevent: RangeError: Maximum call stack size exceeded.

 Why? cause AIService has TwilioService initialized, and TwilioService has AIService initialized in turn causing a circular dependency. In other to use this specific method without actually instantiating the TwilioService class, it was moved here.

*/
export async function sendSMS(from: string, to: string, body: string) {
  try {
    console.log({ from, to, body });
    const msg = await twClient(
      env.TWILIO.ACCT_SID,
      env.TWILIO.AUTH_TOKEN
    ).messages.create({
      body,
      to,
      from: from ?? env.TWILIO.DEFAULT_PHONE_NUMBER1,
    });

    return msg;
  } catch (error) {
    console.log("error", error);
    return null;
  }
}
