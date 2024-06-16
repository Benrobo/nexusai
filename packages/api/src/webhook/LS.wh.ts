import logger from "../config/logger.js";
import { Response, Request } from "express";
import crypto from "crypto";
import env from "../config/env.js";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";

// Lemonsuqeezy Webhook Handler
export default class LSWebhookHandler {
  constructor() {}

  public async twilioPhoneSubscription(req: Request, res: Response) {
    const body = req.body;

    logger.info("Incoming LS webhook received");

    console.log(body);

    await this.verifyWebhook(req, res);
  }

  private async verifyWebhook(req: Request, res: Response) {
    try {
      const secret = env.LS.WH_SECRET;
      const hmac = crypto.createHmac("sha256", secret);
      const digest = Buffer.from(
        hmac.update(req.rawBody ?? "").digest("hex"),
        "utf8"
      );
      const signature = Buffer.from(req.get("X-Signature") || "", "utf8");

      if (!crypto.timingSafeEqual(digest, signature)) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          "Invalid webhook signature",
          401
        );
      }
    } catch (e: any) {
      console.log(e);
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Invalid webhook signature",
        401
      );
    }
  }
}
