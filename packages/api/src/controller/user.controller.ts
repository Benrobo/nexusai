import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import {
  createConversationSchema,
  otpChatWidgetAccountSignInSchema,
  signUpChatWidgetAccountSchema,
  verifyChatWidgetAccountSchema,
} from "../lib/schema_validation.js";
import ConversationService from "../services/conversation.service.js";
import redis from "../config/redis.js";
import sendResponse from "../lib/sendResponse.js";
import logger from "../config/logger.js";
import prisma from "../prisma/prisma.js";
import JWT from "../lib/jwt.js";
import HttpException from "../lib/exception.js";
import ZodValidation from "../lib/zodValidation.js";
import shortUUID from "short-uuid";

type ChatWidgetAccountSignupPayload = {
  email?: string;
  name?: string;
  country_code?: string;
  state?: string;
  city?: string;
};

export default class UserController extends BaseController {
  constructor() {
    super();
  }

  async getUser(req: Request & IReqObject, res: Response) {
    const user = req["user"] as any;
    const userData = await prisma.users.findFirst({
      where: {
        uId: user.id,
      },
    });

    return sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Success", 200, {
      id: userData?.uId,
      email: userData?.email,
      username: userData?.username,
      full_name: userData?.fullname ?? "",
      avatar: userData?.avatar,
      role: userData?.role,
    });
  }
}

export class ChatWidgetUserController {
  private conversationService = new ConversationService();

  public async signUp(req: Request & IReqObject, res: Response) {
    const payload: ChatWidgetAccountSignupPayload = req.body;

    await ZodValidation(signUpChatWidgetAccountSchema, payload, req.serverUrl);

    // create conversation account
    const acctCreated = await this.createChatWidgetAccount(payload);

    // send otp to user email
    const exp = 60 * 5; // 5 minutes
    const otp = Math.floor(100000 + Math.random() * 900000);
    const key = `conv_acct_${otp}_${acctCreated.email}`;
    await redis.set(
      key,
      JSON.stringify({
        otp,
        email: acctCreated.email,
      })
    );
    await redis.expire(key, exp);

    //! send otp code to email

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Account creation was successful. Please verify your account",
      200
    );
  }

  public async verifyAccount(req: Request & IReqObject, res: Response) {
    const payload: {
      email: string;
      otp: string;
    } = req.body;

    // validate payload
    await ZodValidation(verifyChatWidgetAccountSchema, payload, req.serverUrl);

    // check if email exists
    const acctData = await this.getAcctByEmail(payload.email);

    // check if otp exists
    const key = `conv_acct_${payload.otp}_${payload.email}`;
    const otpData = await redis.get(key);

    if (!otpData) {
      return sendResponse.error(
        res,
        RESPONSE_CODE.BAD_REQUEST,
        "Invalid OTP code",
        400
      );
    }

    if (acctData.email !== payload.email) {
      logger.error("[Conversation Account Verification]: Invalid email");
      return sendResponse.error(
        res,
        RESPONSE_CODE.BAD_REQUEST,
        "Invalid email",
        400
      );
    }

    const chatWidgetAccount = await prisma.chatWidgetAccount.findFirst({
      where: {
        email: payload.email,
      },
    });

    await redis.del(key);

    const refToken = await JWT.generateToken(
      { uId: chatWidgetAccount.id },
      "refresh"
    );
    const access_token = await JWT.generateToken(
      { uId: chatWidgetAccount.id },
      "access"
    );

    // update account
    await this.updateAccount(chatWidgetAccount.id, {
      verified: true,
      refresh_token: refToken,
    });

    // set cookies
    this.setCookie("widget_account_token", access_token, res);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Account verified successfully",
      200,
      {
        access_token,
      }
    );
  }

  public async otpSignIn(req: Request & IReqObject, res: Response) {
    const payload: {
      email: string;
      otp: string;
    } = req.body;

    // validate payload
    await ZodValidation(
      otpChatWidgetAccountSignInSchema,
      payload,
      req.serverUrl
    );

    if (payload.email && !payload.otp) {
      // check if email exists
      const acct = await this.getAcctByEmail(payload.email);

      const exp = 60 * 5; // 5 minutes
      const otp = Math.floor(100000 + Math.random() * 900000);
      const key = `conv_acct_${otp}_${acct.email}`;
      await redis.set(
        key,
        JSON.stringify({
          otp,
          email: acct.email,
        })
      );
      await redis.expire(key, exp);

      //! send otp code to email

      return sendResponse.success(
        res,
        RESPONSE_CODE.OTP_CODE_REQUESTED,
        "OTP code requested. Please check your email",
        200
      );
    }
    if (payload.email && payload.otp) {
      await this.verifyAccount(req, res);
    }
  }

  public async getAccount(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const agent_id = req.params["agent_id"];

    const account = await prisma.chatWidgetAccount.findFirst({
      where: {
        id: user.id,
      },
    });

    let chatbotConfig = null;

    if (agent_id) {
      const config = await prisma.chatbotConfig.findFirst({
        where: {
          agentId: agent_id,
        },
        select: {
          agentId: true,
          brand_color: true,
          text_color: true,
          brand_name: true,
          welcome_message: true,
          suggested_questions: true,
        },
      });
      if (config) {
        chatbotConfig = {
          agentId: config?.agentId,
          brand_color: config?.brand_color,
          text_color: config?.text_color,
          brand_name: config?.brand_name,
          welcome_message: config?.welcome_message,
          suggested_questions: config?.suggested_questions,
        };
      }
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Account retrieved successfully",
      200,
      {
        ...account,
        chatbotConfig,
      }
    );
  }

  private async createChatWidgetAccount(data: ChatWidgetAccountSignupPayload) {
    // check if email already exists
    const checkEmail = await prisma.chatWidgetAccount.findFirst({
      where: {
        email: data.email,
      },
    });

    if (checkEmail) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Email already exists",
        400
      );
    }

    const uId = shortUUID.generate();

    const account = await prisma.chatWidgetAccount.create({
      data: {
        id: uId,
        email: data.email,
        name: data.name,
        country_code: data?.country_code,
        state: data?.state,
        city: data?.city,
        verified: false,
        refresh_token: "",
      },
    });

    return account;
  }

  public async updateAccount(
    acct_id: string,
    data: ChatWidgetAccountSignupPayload & {
      verified: boolean;
      refresh_token: string;
    }
  ) {
    // check if account exists
    const checkAcct = await prisma.chatWidgetAccount.findFirst({
      where: {
        id: acct_id,
      },
    });

    if (!checkAcct) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Account not found",
        400
      );
    }

    // update account
    const account = await prisma.chatWidgetAccount.update({
      where: {
        id: acct_id,
      },
      data: {
        ...data,
      },
    });

    return account;
  }

  public async getAcctByEmail(email: string) {
    const acct = await prisma.chatWidgetAccount.findFirst({
      where: {
        email,
      },
    });

    if (!acct) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Account not found",
        404
      );
    }

    return acct;
  }

  public async logoutWidgetAccount(req: Request & IReqObject, res: Response) {
    res.cookie("widget_account_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0),
    });
    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Logout successful",
      200
    );
  }

  private setCookie(name: string, value: string, res: Response) {
    res.cookie(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
}
