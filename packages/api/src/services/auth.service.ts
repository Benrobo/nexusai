import { Request, Response } from "express";
import ZodValidation from "../lib/zodValidation";
import { emailSchema, loginSchema } from "../lib/schema_validation";
import redis from "../config/redis";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE } from "../types";
import prisma from "../config/prisma";
import HttpException from "../lib/exception";
import shortUUID from "short-uuid";
import env from "../config/env";
import GoogleAuth from "../lib/google.auth";

export default class AuthService {
  constructor() {}

  public async googleAuth(req: Request, res: Response) {
    const state = shortUUID.generate();
    await GoogleAuth.signIn({ req, res, state });
  }

  public async googleAuthCallback(req: Request, res: Response) {
    const code = req.query.code as string;
    const { tokens } = await GoogleAuth.callBack({ code });

    if (!tokens) {
      throw new HttpException(RESPONSE_CODE.ERROR, "Google Auth failed", 401);
    }

    const { id_token } = tokens;
    const ticket = await GoogleAuth.verifyIdToken({ idToken: id_token! });

    const payload = ticket.getPayload();
    const email = payload?.email;

    if (!email) {
      throw new HttpException(
        RESPONSE_CODE.ERROR,
        "Email not found in google response",
        401
      );
    }

    const user = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      // create one
      const uId = shortUUID.generate();
      const username = email.split("@")[0];
      const fullname = payload?.name;
      const avatar = payload?.picture;

      await prisma.users.create({
        data: {
          email,
          uId,
          username,
          fullname,
          avatar,
          google_ref_token: tokens.refresh_token,
        },
      });
      // set cookie
      res.cookie("token", tokens.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      console.log(`User logged in with email: ${email}`);

      res.redirect(`${env.CLIENT_URL}/dashboard`);
      return;
    }

    // update
    await prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        google_ref_token: tokens.refresh_token,
      },
    });

    // set cookie
    res.cookie("token", tokens.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    console.log(`User created: ${email}`);

    res.redirect(`${env.CLIENT_URL}/dashboard`);
  }
}
