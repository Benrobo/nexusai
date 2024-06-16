import logger from "../config/logger.js";
import { Response, Request } from "express";
import crypto from "crypto";
import env from "../config/env.js";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";
import type {
  LS_Subscription,
  LS_WebhookPayload,
} from "../types/lemonsqueezy.types.js";
import prisma from "../prisma/prisma.js";

// Lemonsuqeezy Webhook Handler
export default class LSWebhookHandler {
  constructor() {}

  public async twilioPhoneSubscription(req: Request, res: Response) {
    const body = req.body as LS_WebhookPayload;
    await this.verifyWebhook(req, res);

    // log wh body
    console.log(body);

    const { meta } = body;
    const { event_name } = meta;

    switch (event_name) {
      case "subscription_created" || "subscription_updated":
        await this.handleSubscriptionState(body);
        break;
      default:
        break;
    }
  }

  private async handleSubscriptionState(body: LS_WebhookPayload) {
    const { data, meta } = body;
    const { event_name, custom_data } = meta;
    const {
      status,
      user_email,
      user_name,
      test_mode,
      ends_at,
      renews_at,
      customer_id,
      order_id,
      product_name,
      variant_id,
      variant_name,
      store_id,
      card_brand,
      card_last_four,
    } = (data as LS_Subscription)?.attributes;
    const { user_id } = custom_data;

    const user = await prisma.users.findFirst({ where: { uId: user_id } });

    if (!user) {
      console.log(`${event_name.toUpperCase()} EVENT`);
      const msg = `User ${user_email} with id ${user_id} not found`;
      console.log(`❌ ${msg}`);
      throw new HttpException(RESPONSE_CODE.USER_NOT_FOUND, msg, 404);
    }

    // Prevent duplicate subscription
    const userSubscription = await prisma.subscriptions.findFirst({
      where: {
        uId: user_id,
      },
    });

    if (!userSubscription) {
      // Update
      logger.info("Subscription Created");
    } else {
      logger.info("Subscription Updated");
    }
  }

  private async SubscriptionUpdated(data: LS_Subscription, custom_data: any) {
    // log subscription updated
    logger.info("Subscription Updated");
    console.log(data);
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

      res.status(200).send("Webhook verified");
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
