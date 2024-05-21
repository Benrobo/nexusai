import { Request, Response } from "express";
import HttpException from "../lib/exception";
import { RESPONSE_CODE } from "../types";
import prisma from "../config/prisma";
import JWT from "../lib/jwt";

export function isAuthenticated(fn: Function) {
  return async (req: Request, res: Response) => {
    try {
      const jwtToken = await new JWT().getToken(req);

      if (!jwtToken) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          "Unauthorized",
          401
        );
      }

      let user = await prisma.users?.findFirst({
        where: { uId: jwtToken?.uId as string },
      });

      if (!user) {
        throw new HttpException(
          RESPONSE_CODE.UNAUTHORIZED,
          `Unauthorized, Invalid Token`,
          403
        );
      }

      (req as any)["user"] = { id: user.uId };
      return await fn(req, res);
    } catch (e: any) {
      console.log(e);
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, e.message, 401);
    }
  };
}

export function isAdmin(fn: Function) {
  return async (req: Request) => {
    const userId = (req as any)?.user?.id;

    if (!userId) {
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, "Unauthorized", 401);
    }

    const admin = await prisma.users.findFirst({
      where: { uId: userId, role: "admin" },
    });

    if (!admin) {
      throw new HttpException(RESPONSE_CODE.UNAUTHORIZED, "Unauthorized", 401);
    }
    return await fn(req);
  };
}
