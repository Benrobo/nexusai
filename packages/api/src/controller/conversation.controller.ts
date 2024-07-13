import { Request, Response } from "express";
import { RESPONSE_CODE, type IReqObject } from "../types/index.js";
import ZodValidation from "../lib/zodValidation.js";
import {
  createConversationSchema,
  otpConvAccountSignInSchema,
  signUpConvAccountSchema,
  verifyConvAccountSchema,
} from "../lib/schema_validation.js";
import type {
  ConvSignupPayload,
  CreateConversationPayload,
} from "../types/conversation.type.js";
import ConversationService from "../services/conversation.service.js";
import redis from "../config/redis.js";
import sendResponse from "../lib/sendResponse.js";
import logger from "../config/logger.js";
import prisma from "../prisma/prisma.js";
import JWT from "../lib/jwt.js";
import HttpException from "../lib/exception.js";

export default class ConversationController {
  private conversationService = new ConversationService();
  constructor() {}

  public getConversationById(req: Request & IReqObject, res: Response) {
    // get conversation by id
  }

  public async getAllConversationsByConvAccount(
    req: Request & IReqObject,
    res: Response
  ) {
    const user = req.user;

    const conversations = await prisma.conversations.findMany({
      where: {
        conversationAccountId: user.id,
      },
    });

    //! format the response sent to client
    // ! should contain last message, date, sender / receiver name, etc

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversations retrieved successfully",
      200,
      conversations
    );
  }

  // Admin / Owner Specific
  public async getAllConversations(req: Request & IReqObject, res: Response) {
    const user = req.user;

    const conversations = await prisma.conversations.findMany();
    const userSpecificAgents = await prisma.agents.findMany({
      where: {
        userId: user.id,
      },
    });

    //! filter out conversations that belong to the user created agents

    //! format the response sent to client
    // ! should contain last message, date, sender / receiver name, etc

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversations retrieved successfully",
      200,
      conversations
    );
  }
  // Admin / Owner Specific
  public async getConversationsByAgent(
    req: Request & IReqObject,
    res: Response
  ) {}

  // start a new conversation
  public async createConversation(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const payload = req.body as CreateConversationPayload;

    await ZodValidation(createConversationSchema, payload, req.serverUrl);

    // check if conversation account exists
    const convAcct = await prisma.conversationAccount.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!convAcct) {
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Conversation account not found",
        403
      );
    }

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agent_id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    if (agent.type !== "CHATBOT") {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Agent type not supported",
        400
      );
    }

    // create conversation
    const conversation = await this.conversationService.createConversation({
      userId: user.id,
      agent_id: payload.agent_id,
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversation created successfully",
      201,
      {
        id: conversation.id,
        agent_id: conversation.agentId,
      }
    );
  }

  // handle conversation between customer -> agent -> admin
  public async chat(req: Request & IReqObject, res: Response) {}
}

// create conversation account (mean't for users interracting via chatbot widget)

export class ConversationAuthController {
  private conversationService = new ConversationService();

  public async signUp(req: Request & IReqObject, res: Response) {
    const payload: ConvSignupPayload = req.body;

    await ZodValidation(signUpConvAccountSchema, payload, req.serverUrl);

    // create conversation account
    const acctCreated =
      await this.conversationService.createConvAccount(payload);

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
      "Account creation was successful. Please verify your email",
      200
    );
  }

  public async verifyAccount(req: Request & IReqObject, res: Response) {
    const payload: {
      email: string;
      otp: string;
    } = req.body;

    // validate payload
    await ZodValidation(verifyConvAccountSchema, payload, req.serverUrl);

    // check if email exists
    const acctData = await this.conversationService.getConvAcctByEmail(
      payload.email
    );

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

    const convAcct = await prisma.conversationAccount.findFirst({
      where: {
        email: payload.email,
      },
    });

    await redis.del(key);

    const refToken = await JWT.generateToken({ uId: convAcct.id }, "refresh");
    const access_token = await JWT.generateToken(
      { uId: convAcct.id },
      "access"
    );

    // update account
    await this.conversationService.updateConvAccount(convAcct.id, {
      verified: true,
      refresh_token: refToken,
    });

    // set cookies
    this.setCookie("conv_token", access_token, res);

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
    await ZodValidation(otpConvAccountSignInSchema, payload, req.serverUrl);

    if (payload.email && !payload.otp) {
      // check if email exists
      const acct = await this.conversationService.getConvAcctByEmail(
        payload.email
      );

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
        RESPONSE_CODE.SUCCESS,
        "OTP code requested. Please check your email",
        200
      );
    }
    if (payload.email && payload.otp) {
      await this.verifyAccount(req, res);
    }
  }

  public async getConversationAccount(
    req: Request & IReqObject,
    res: Response
  ) {
    const user = req.user;

    const account = await prisma.conversationAccount.findFirst({
      where: {
        id: user.id,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversation account retrieved successfully",
      200,
      account
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
