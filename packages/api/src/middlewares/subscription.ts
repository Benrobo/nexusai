import { Request, Response } from "express";
import prisma from "../config/prisma";
import isUserPremium from "../lib/isUserPremium";
import type { SubscriptionStatus } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface ReqUserObj {
  id: string;
}

interface SubscriptionData {
  status: SubscriptionStatus;
  product_id: string;
  variant_id: string | null;
  customer_id: string | null;
  ends_at?: Date | null;
  renews_at?: string | null;
}

export interface IMiddlewareSubResponseData {
  subscription: SubscriptionData | null;
  isPro: Boolean;
  expired: Boolean;
  ends_at: string | null;
}

export function checkUserSubscription(fn: Function) {
  console.log(`\ncheckUserSubscription Middleware Invoked.\n`);
  return async (req: Request, res: Response) => {
    const user = (req as any)["user"] as ReqUserObj;
    const uId = user?.id;

    let response: IMiddlewareSubResponseData = {
      subscription: null,
      isPro: false,
      expired: false,
      ends_at: null,
    };

    const subscription = await prisma.subscriptions.findFirst({
      where: {
        uId,
      },
      select: {
        status: true,
        product_id: true,
        variant_id: true,
        customer_id: true,
        ends_at: true,
        renews_at: true,
      },
    });

    const formattedRenewDate = dayjs(subscription?.renews_at).format(
      "DD MMM, YY"
    );

    if (!subscription) {
      req["user_sub_resp"] = response;
    } else {
      const isPro = isUserPremium({ subscription });
      response = {
        subscription: {
          status: subscription?.status,
          product_id: subscription?.product_id,
          variant_id: subscription?.variant_id,
          customer_id: subscription?.customer_id,
          renews_at: formattedRenewDate,
        },
        isPro: isPro.isPro,
        expired: isPro.expired,
        ends_at: isPro.ends_at,
      };
      req["user_sub_resp"] = response;
    }

    return fn(req, res);
  };
}
