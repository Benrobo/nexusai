import { Request, Response } from "express";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE, type IReqObject } from "../types/index.js";
import prisma from "../prisma/prisma.js";
import GoogleAuth, { googleClient } from "../lib/google.auth.js";
import type { TokenInfo } from "google-auth-library";
import JWT from "../lib/jwt.js";
import env from "../config/env.js";

export function isAuthenticated(fn: Function) {
  return async (req: Request & IReqObject, res: Response) => {
    req["serverUrl"] = `${env.API_URL}${req.url}`;
    const token = req.cookies["token"];
    const userId = req.cookies["_uId"];

    if (!token || !userId) {
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, "Unauthorized", 401);
    }

    let decoded: TokenInfo | null = null;
    try {
      // verify token
      decoded = await GoogleAuth.verifyAccessToken(token);
    } catch (e: any) {
      console.log(`Refreshing token...`);

      const user = await prisma.users.findFirst({
        where: {
          uId: userId,
        },
      });

      if (!user) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          "Unauthorized, user not found",
          401
        );
      }

      const refToken = user.google_ref_token;

      // refresh token
      googleClient.setCredentials({
        refresh_token: refToken,
      });

      const credentials = (await googleClient.refreshAccessToken()).credentials;

      if (!credentials) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          "Unauthorized",
          401
        );
      }

      const userInfo = await googleClient.getTokenInfo(
        credentials.access_token!
      );

      if (!userInfo) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          "Unauthorized",
          401
        );
      }

      // set cookie
      res.cookie("token", credentials.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      // set userId in cookie
      res.cookie("_uId", user.uId, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      req["user"] = {
        id: user.uId!,
      };

      return await fn(req, res);
    }

    const email = decoded?.email;

    // check if user exists in our db
    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!email || !user) {
      // clear cookie
      res.clearCookie("token");
      res.clearCookie("_uId");
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, "Unauthorized", 401);
    }

    req["user"] = {
      id: user?.uId!,
    };

    return await fn(req, res);
  };
}

// conversation account middleware
export function isWidgetAccountAuthenticated(fn: Function) {
  return async (req: Request & IReqObject, res: Response) => {
    req["serverUrl"] = `${env.API_URL}${req.url}`;
    const token = req.cookies["widget_account_token"]; // access_token

    if (!token) {
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, "Unauthorized", 401);
    }

    let decoded: {
      uId: string;
    } | null = null;

    try {
      // decode jwt token
      decoded = (await JWT.verifyToken(token)) as { uId: string };
      // check if user exists in our db
      const user = await prisma.chatWidgetAccount.findFirst({
        where: {
          id: decoded.uId,
        },
      });

      if (!user) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          "Unauthorized, conversation account doesn't exists",
          401
        );
      }

      req["user"] = {
        id: user.id,
      };

      return await fn(req, res);
    } catch (err: any) {
      console.log(err);
      const code = RESPONSE_CODE[err.code as any];
      throw new HttpException(
        // @ts-expect-error
        RESPONSE_CODE[code as any] ?? RESPONSE_CODE.UNAUTHORIZED,
        err?.message ?? "Unauthorized",
        401
      );
    }
  };
}

// unified middleware to handle both middlewares above
export function dualUserAuthenticator(fn: Function) {
  return async (req: Request & IReqObject, res: Response) => {
    const headers = req.headers;
    const userAccount = headers["x-nexus-admin-account"];
    const widgetUserAccount = headers["x-nexus-widget-account"];

    if (userAccount) {
      return await isAuthenticated(fn)(req, res);
    } else if (widgetUserAccount) {
      return await isWidgetAccountAuthenticated(fn)(req, res);
    } else {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized, token not found in headers",
        401
      );
    }
  };
}

export function authorizeCronFunction(fn: Function) {
  return async (req: Request & IReqObject, res: Response) => {
    const headers = req.headers;
    const cronToken = headers["x-nexus-cron-token"];

    if (cronToken === env.NEXUS_CRON_TOKEN) {
      return await fn(req, res);
    } else {
      throw new HttpException(
        RESPONSE_CODE.UNAUTHORIZED,
        "Unauthorized cron function, token not found in headers.",
        401
      );
    }
  };
}
