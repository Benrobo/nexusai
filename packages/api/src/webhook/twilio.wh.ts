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

    await this.twService.handleIncomingCall(body, res);
  }

  public async processOngoingVoiceConv(req: Request, res: Response) {
    const body = req.body;

    logger.info("Processing ongoing voice conversation webhook received");

    console.log(body);

    await this.twService.processVoiceConversation(body, res);
  }
}
