import logger from "../config/logger.js";
import { Response, Request } from "express";
import TelegramBotService from "../services/telegram.service.js";

// set webhook url
// https://api.telegram.org/bot<token>/METHOD_NAME

export default class TelegramWebhookHandler {
  constructor() {}

  async initTgBotService(req: Request, res: Response) {
    let tgService;
    if (!tgService) {
      tgService = new TelegramBotService();
    }
    logger.info("TelegramWebhookHandler.initTgBotService ✅");
    console.log(req.body);
  }
}
