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

  public async processSalesAssistantCall(req: Request, res: Response) {
    const body = req.body;

    logger.info("Processing ongoing sales voice call WH received");

    console.log(body);

    await this.twService.processVoiceSAConversation(body, res);
  }

  public async processAntiTheftCall(req: Request, res: Response) {
    const body = req.body;

    logger.info("Processing ongoing sales-assistant voice call WH received");

    console.log(body);

    await this.twService.processVoiceATConversation(body, res);
  }
}
