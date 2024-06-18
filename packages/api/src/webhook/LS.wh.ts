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
import retry from "../lib/retry.js";
import { TwilioService } from "../services/twilio.service.js";
import shortUUID from "short-uuid";

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
    try {
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
        product_id,
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
          subscription_id: data.id,
        },
      });

      if (!userSubscription) {
        // Update
        logger.info("Subscription Created");

        // Check if subscription exists
        const subscriptionExists = await prisma.subscriptions.findFirst({
          where: {
            subscription_id: data.id,
          },
        });

        if (subscriptionExists) {
          const msg = `Duplicate subscription with id ${data.id}`;
          console.log(`❌ ${msg}`);
          throw new HttpException(RESPONSE_CODE.ERROR, msg, 400);
        }

        const gracePeriodStart = new Date();

        const subscription = await prisma.subscriptions.create({
          data: {
            id: shortUUID.generate(),
            status,
            user_email,
            user_name,
            test_mode,
            ends_at,
            renews_at,
            type: "TWILIO_PHONE_NUMBERS",
            customer_id: String(customer_id),
            order_id: String(order_id),
            product_id: String(product_id),
            product_name,
            variant_id: String(variant_id),
            variant_name,
            store_id: String(store_id),
            card_brand,
            card_last_four,
            subscription_id: data.id,
            grace_period: gracePeriodStart,
            user: {
              connect: {
                uId: user_id,
              },
            },
          },
        });

        if (!subscription) {
          const msg = `Error creating subscription for user ${user_email} with id ${user_id}`;
          console.log(`❌ ${msg}`);
          throw new HttpException(RESPONSE_CODE.ERROR, msg, 400);
        }

        console.log(
          `✅ [TWILIO_PHONE_NUMBERS]: Subscription created for user ${user_email}`
        );

        // provision phone number
        logger.info("PROVISIONING PHONE NUMBER INITIATED...");

        const twilioService = new TwilioService();
        await retry({
          fn: twilioService.provisionPhoneNumber.bind(twilioService),
          args: [
            {
              subscription_id: data.id,
              user_id: custom_data.user_id,
              phone_number: custom_data.phone_number,
              agent_id: custom_data.agent_id,
            },
          ],
          functionName: "ProvisionPhoneNumber",
          retries: 3,
        });
      } else {
        logger.info("Subscription Updated");
      }
    } catch (e: any) {
      console.log(e);
      throw new HttpException(RESPONSE_CODE.ERROR, e.message, 400);
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
