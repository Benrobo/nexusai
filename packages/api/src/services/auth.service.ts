import { Request, Response } from "express";
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

  private setCookie(name: string, value: string, res: Response) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
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

      this.setCookie("token", tokens.access_token!, res);
      this.setCookie("_uId", uId, res);

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

    this.setCookie("token", tokens.access_token!, res);
    this.setCookie("_uId", user.uId, res);

    console.log(`User created: ${email}`);

    res.redirect(`${env.CLIENT_URL}/dashboard`);
  }
}
