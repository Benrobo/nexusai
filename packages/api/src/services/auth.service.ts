import { Request, Response } from "express";
import ZodValidation from "../lib/zodValidation";
import { emailSchema, loginSchema } from "lib/schema_validation";
import redis from "../config/redis";
import sendResponse from "lib/sendResponse";
import { RESPONSE_CODE } from "../types";
import prisma from "../config/prisma";
import HttpException from "../lib/exception";
import shortUUID from "short-uuid";
import JWT from "lib/jwt";
import env from "../config/env";

export default class AuthService {
  constructor() {}

  public async otpAuth(req: Request, res: Response) {
    const payload = req.body;

    // validate email
    const baseUrl = `${env.API_URL}${req.url}`;
    await ZodValidation(emailSchema, payload, baseUrl);

    const { email } = payload;
    const otp = Math.floor(100000 + Math.random() * 900000);
    await redis.set(
      email,
      JSON.stringify({
        email,
        otp,
      })
    );
    await redis.expire(email, 60); // 1 minute

    // send otp to email
    const htmlMailData = `
      <div>
        <h1>OTP Verification</h1>
        <p>Your OTP is ${otp}</p>
      </div>
    `;
    // await resendSendMail(email, "OTP Verification", htmlMailData);

    console.log(`\n\nOTP SENT: ${otp}\n\n`);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Email sent successfully",
      200,
      process.env.NODE_ENV === "development" ? otp : null
    );
  }

  public async login(req: Request, res: Response) {
    const payload = req.body;
    const { email, otp_code } = payload;

    await ZodValidation(loginSchema, payload, `${env.API_URL}${req.url}`);

    // check if user exists within db
    const user = await prisma.users?.findFirst({
      where: {
        email,
      },
    });

    // validate OTP
    await this.validateOTP(email, otp_code);

    // delete user from cache
    await redis.del(email);

    // store user in db
    // create one
    const emailParts = email.split("@");
    const username = emailParts[0];
    const avatar = `https://api.dicebear.com/7.x/big-smile/png?seed=${email}`;
    const uId = user?.uId ?? shortUUID.generate();

    // snapx token
    const snapx_token = shortUUID.generate().slice(0, 11);

    if (!user) {
      await prisma.users.create({
        data: {
          uId,
          email,
          username,
          avatar,
          provider: "credentials",
          role: "user",
          snapx_token,
        },
      });
    }

    // generate jwt token
    const accessToken = await JWT.generateToken({ uId }, "access");

    // store token in cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    console.log("user loggedIn");

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "User authenticated successfully",
      200,
      {
        accessToken,
      }
    );
  }

  public static async logout() {
    return "logout";
  }

  private async validateOTP(email: string, otpCode: string) {
    const redisData = await redis.get(email);
    if (!redisData) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_OTP,
        "Invalid OTP. Code has expired",
        400
      );
    }

    const { otp } = JSON.parse(redisData);

    if (String(otp) !== String(otpCode)) {
      throw new HttpException(RESPONSE_CODE.INVALID_OTP, "Invalid OTP", 400);
    }
  }
}
