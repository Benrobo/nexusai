import { Request, Response } from "express";
import HttpException from "../lib/exception";
import { RESPONSE_CODE, type IReqObject } from "../types";
import prisma from "../config/prisma";
import GoogleAuth, { googleClient } from "../lib/google.auth";
import type { TokenInfo, Credentials } from "google-auth-library";

export function isAuthenticated(fn: Function) {
  return async (req: Request & IReqObject, res: Response) => {
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
          "Unauthorized",
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

    if (!email) {
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, "Unauthorized", 401);
    }

    req["user"] = {
      id: user?.uId!,
    };

    return await fn(req, res);
  };
}
