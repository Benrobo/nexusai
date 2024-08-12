import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import { RESPONSE_CODE, IReqObject, type AgentType } from "../types/index.js";
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
import { SentimentAnalysisService } from "../services/sentiment.service.js";
import type { KnowledgeBaseType } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import sendMail from "../helpers/sendMail.js";

dayjs.extend(relativeTime);

type ChatWidgetAccountSignupPayload = {
  email?: string;
  name?: string;
  country_code?: string;
  state?: string;
  city?: string;
};

export default class UserController extends BaseController {
  sentimentAnalysisService = new SentimentAnalysisService();
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

  private calculatePercentages(sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  }) {
    const total = sentiment.positive + sentiment.negative + sentiment.neutral;

    const percentages = {
      positive: (sentiment.positive / total) * 100,
      negative: (sentiment.negative / total) * 100,
      neutral: (sentiment.neutral / total) * 100,
    };

    return percentages;
  }

  private async analyzeSentiments(messages: { content: string }[]) {
    const sentiment = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    for (const message of messages) {
      const { score } = await this.sentimentAnalysisService.analyzeSentiment(
        message.content
      );
      if (score > 0) sentiment.positive++;
      else if (score < 0) sentiment.negative++;
      else sentiment.neutral++;
    }

    return sentiment;
  }

  private async getAgentIds(userId: string) {
    const agents = await prisma.agents.findMany({
      where: { userId },
      select: { id: true },
    });
    return agents.map((agent) => agent.id);
  }

  async retrieveSentimentAnalysisOfUsersConversations(
    req: Request & IReqObject,
    res: Response
  ) {
    const agentIds = await this.getAgentIds(req.user.id);

    const conversations = await prisma.conversations.findMany({
      where: { agentId: { in: agentIds } },
      select: { chat_messages: true },
    });

    const allMessages = conversations.flatMap((conv) => conv.chat_messages);
    const sentiment = await this.analyzeSentiments(allMessages);
    const percentages = this.calculatePercentages(sentiment);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      percentages
    );
  }

  async retrieveSentimentAnalysisOfConversationMessages(
    req: Request & IReqObject,
    res: Response
  ) {
    const agentIds = await this.getAgentIds(req.user.id);
    const conversation_id = req.params["conversation_id"];

    const conversation = await prisma.conversations.findFirst({
      where: {
        agentId: { in: agentIds },
        id: conversation_id,
      },
      select: { chat_messages: true },
    });

    if (!conversation) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Conversation not found",
        404
      );
    }

    const sentiment = await this.analyzeSentiments(conversation.chat_messages);
    const percentages = this.calculatePercentages(sentiment);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      percentages
    );
  }

  async retrieveSentimentAnalysisOfCallLogs(
    req: Request & IReqObject,
    res: Response
  ) {
    const agentIds = await this.getAgentIds(req.user.id);

    const callLogs = await prisma.callLogs.findMany({
      where: { agentId: { in: agentIds } },
      select: { messages: true },
    });

    const allMessages = callLogs.flatMap((log) => log.messages);
    const sentiment = await this.analyzeSentiments(allMessages);
    const percentages = this.calculatePercentages(sentiment);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      percentages
    );
  }

  async getTotalConversations(req: Request & IReqObject, res: Response) {
    const agentIds = await this.getAgentIds(req.user.id);

    const totalConversations = await prisma.conversations.count({
      where: { agentId: { in: agentIds } },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      totalConversations
    );
  }

  async getTotalKnowledgeBase(req: Request & IReqObject, res: Response) {
    const knowledegebase = await prisma.knowledgeBase.findMany({
      where: { userId: req.user.id },
      include: { kb_data: true },
    });

    const totalKb: {
      type: KnowledgeBaseType;
      total: number;
    }[] = [
      {
        type: "PDF",
        total: 0,
      },
      {
        type: "WEB_PAGES",
        total: 0,
      },
    ];

    if (knowledegebase.length > 0) {
      for (const kb of knowledegebase) {
        const kbData = kb.kb_data[0];
        const exists = totalKb?.find((kb) => kb.type === kbData.type);

        if (exists) {
          totalKb.map((kb) => {
            if (kb.type === kbData.type) {
              kb.total = kb.total + 1;
            }
            return kb;
          });
        }
      }
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      totalKb
    );
  }

  async getTotalAgents(req: Request & IReqObject, res: Response) {
    const agents = await prisma.agents.findMany({
      where: { userId: req.user.id },
      select: { type: true },
    });

    const totalAgents: {
      type: AgentType;
      total: number;
    }[] = [];

    if (agents.length > 0) {
      for (const agent of agents) {
        const exists = totalAgents?.find((ag) => ag.type === agent.type);

        if (exists) {
          totalAgents.map((ag) => {
            if (ag.type === agent.type) {
              ag.total = ag.total + 1;
            }
            return ag;
          });
        } else {
          totalAgents.push({
            type: agent.type,
            total: 1,
          });
        }
      }
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Success",
      200,
      totalAgents
    );
  }

  async getTotalAIMessages(req: Request & IReqObject, res: Response) {
    const agentIds = await this.getAgentIds(req.user.id);

    const [convMessagesWithAI, callLogAIMessages] = await Promise.all([
      prisma.chatMessages.count({
        where: {
          role: "agent",
          agentId: { in: agentIds },
        },
      }),
      prisma.callLogsMessages.count({
        where: {
          entity_type: "agent",
          call_logs: {
            agentId: { in: agentIds },
            userId: req.user.id,
          },
        },
      }),
    ]);

    const totalAIMessages = convMessagesWithAI + callLogAIMessages;

    return sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Success", 200, {
      totalMessagesCombMessages: totalAIMessages,
      totalAIConversationsMessages: convMessagesWithAI,
      totalAICallLogsMessages: callLogAIMessages,
    });
  }

  async getCustomerGrowthStats(req: Request & IReqObject, res: Response) {
    const agentIds = await this.getAgentIds(req.user.id);

    const conversations = await prisma.conversations.findMany({
      where: {
        agentId: { in: agentIds },
      },
      distinct: ["conversationAccountId"],
      include: { widget_user_account: true },
    });

    const now = dayjs();
    const startOfThisWeek = now.startOf("week");
    const startOfLastWeek = startOfThisWeek.subtract(1, "week");

    const customers = {
      lastWeek: 0,
      thisWeek: 0,
    };

    for (const conv of conversations) {
      const customer = conv.widget_user_account;
      if (!customer) continue;

      const accountCreatedDate = await prisma.chatWidgetAccount.findUnique({
        where: { id: conv.conversationAccountId },
        select: { created_at: true },
      });

      if (!accountCreatedDate) continue;

      const createdAt = dayjs(accountCreatedDate.created_at);

      if (createdAt.isAfter(startOfThisWeek) && createdAt.isBefore(now)) {
        customers.thisWeek++;
      } else if (
        createdAt.isAfter(startOfLastWeek) &&
        createdAt.isBefore(startOfThisWeek)
      ) {
        customers.lastWeek++;
      }
    }

    let rateType: "increase" | "decrease" | "no-change" = "no-change";
    let percentage = 0;

    if (customers.lastWeek > customers.thisWeek) {
      rateType = "decrease";
      percentage =
        ((customers.lastWeek - customers.thisWeek) / customers.lastWeek) * 100;
    } else if (customers.lastWeek < customers.thisWeek) {
      rateType = "increase";
      percentage =
        (customers.thisWeek - customers.lastWeek) / customers.lastWeek;
    }

    return sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Success", 200, {
      total: customers.thisWeek,
      rate: {
        type: rateType,
        percentage: Number(percentage.toFixed(2)),
      },
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
    const template = `
      <h1> OTP Code </h1>

      <p>Use the OTP code below to sign in to your account</p>

      <h1>Your OTP code is: <b>${otp}</b></h1>
    `;
    await sendMail({
      to: acctCreated.email,
      subject: "OTP Code",
      html: template,
    });

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
      country?: string;
      state?: string;
      city?: string;
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
      ...(payload.country && { country: payload.country }),
      ...(payload.state && { state: payload.state }),
      ...(payload.city && { city: payload.city }),
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

      const template = `
        <h1> OTP Code </h1>

        <p>Use the OTP code below to sign in to your account</p>

        <h2>Your OTP code is: <b>${otp}</b></h2>
      `;

      await sendMail({
        to: acct.email,
        subject: "OTP Code",
        html: template,
      });

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
      country?: string;
      state?: string;
      city?: string;
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

  public async deleteAccount(req: Request & IReqObject, res: Response) {
    const user = req.user;

    // delete all conversations related to the account
    const deletedConversations = prisma.conversations.deleteMany({
      where: {
        conversationAccountId: user.id,
      },
    });

    const deletedAccount = prisma.chatWidgetAccount.delete({
      where: {
        id: user.id,
      },
    });

    await prisma.$transaction([deletedConversations, deletedAccount]);

    // logout user
    res.cookie("widget_account_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0),
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Account deleted successfully",
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
