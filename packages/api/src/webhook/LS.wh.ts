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
import dayjs from "dayjs";
import sendMail from "../helpers/sendMail.js";

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
      case "subscription_created":
        await this.handleSubscriptionState(body);
        break;
      case "subscription_updated":
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
            agent: {
              connect: {
                id: custom_data?.agent_id,
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
        await this.SubscriptionUpdated(data as LS_Subscription, custom_data);
      }
    } catch (e: any) {
      console.log(e);
      throw new HttpException(RESPONSE_CODE.ERROR, e.message, 400);
    }
  }

  private async SubscriptionUpdated(data: LS_Subscription, custom_data: any) {
    try {
      console.log("SUBSCRIPTION UPDATED EVENT");
      const { status, ends_at, product_name } = (data as LS_Subscription)
        ?.attributes;
      const { user_id, agent_id } = custom_data;

      const user = await prisma.users.findFirst({ where: { uId: user_id } });

      if (
        (
          ["cancelled", "expired", "past_due", "unpaid"] as (typeof status)[]
        ).includes(status)
      ) {
        const grace_period = dayjs().add(1, "day").toDate();
        await prisma.subscriptions.update({
          where: {
            subscription_id: data.id,
          },
          data: {
            status,
            grace_period,
            ends_at,
          },
        });

        const subscriptionGracePeriodNotif = `
          <p>Dear ${user.fullname},</p>

          <p>Your subscription to <b>${product_name} (NexusAI)</b> has been cancelled.</p>
          <p>You have a grace period of <b>24 hours</b> to renew your subscription before your phone number is removed from the system.</p>
          <p>Kindly renew your subscription to continue using your phone number.</p>

          <p>Thank you for using NexusAI.</p>
          `;

        await retry({
          fn: sendMail,
          args: [
            {
              to: user.email,
              subject: "🚨 Subscription Cancellation Notification",
              html: subscriptionGracePeriodNotif,
            },
          ],
          functionName: "sendMail - Subscription Cancellation Notification",
          retries: 5,
        });
      }
      if (status === "active") {
        const agent = await prisma.agents.findFirst({
          where: {
            userId: user_id,
            id: agent_id,
          },
        });

        if (!agent) {
          // send user a mail that their subscription was resumed but no agent was found for the subscription
          const mailTemplate = `
          <p>Dear ${user.fullname},</p>

          <p>Your subscription to <b>${product_name} (NexusAI)</b> has been resumed.</p>
          <p>However, we could not find an agent for your subscription. Kindly contact support to resolve this issue or cancel your subscription, if this was not intentional.</p>

          <p>Thank you for using NexusAI.</p>
        `;

          await retry({
            fn: sendMail,
            args: [
              {
                to: user.email,
                subject: "🚨 Subscription Resumed Notification",
                html: mailTemplate,
              },
            ],
            functionName: "sendMail - Subscription Resumed Notification",
            retries: 5,
          });
          console.log(`❌ Subscription Resumed but no agent found`);
          return;
        }
        await prisma.subscriptions.update({
          where: {
            subscription_id: data.id,
          },
          data: {
            status,
            grace_period: null,
            ends_at,
          },
        });

        console.log(`✅ Subscription Resumed`);
      }
    } catch (e: any) {
      console.log(` ❌ Error updating subscription: ${e.message}`);
      console.log(e);
    }
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
