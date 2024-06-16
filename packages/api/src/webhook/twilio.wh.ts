import logger from "../config/logger.js";
import { Response, Request } from "express";

export default class TwilioWebhookHandler {
  constructor() {}

  public async incomingCall(req: Request, res: Response) {
    const body = req.body;

    logger.info("Incoming call webhook received");

    console.log(body);
  }

  // PHONE NUMBER SUBSCRIPTIONS (LS)
  public async phoneNumberSubscription(req: Request, res: Response) {
    const body = req.body;

    logger.info("Incoming call webhook received");

    console.log(body);
  }
}
