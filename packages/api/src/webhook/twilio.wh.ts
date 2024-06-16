import { TwilioService } from "../services/twilio.service.js";
import logger from "../config/logger.js";
import { Response, Request } from "express";

export default class TwilioWebhookHandler {
  twService = new TwilioService();
  constructor() {}

  public async incomingCall(req: Request, res: Response) {
    const body = req.body;

    logger.info("Incoming call webhook received");

    console.log(body);

    await this.twService.handleIncomingCall(body);
  }

  // PHONE NUMBER SUBSCRIPTIONS (LS)
  public async phoneNumberSubscription(req: Request, res: Response) {
    const body = req.body;

    logger.info("Incoming call webhook received");

    console.log(body);
  }
}
