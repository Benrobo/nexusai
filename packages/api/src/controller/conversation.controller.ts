import { Request, Response } from "express";
import { RESPONSE_CODE, type IReqObject } from "../types/index.js";
import ZodValidation from "../lib/zodValidation.js";
import {
  createConversationSchema,
  processConversationSchema,
} from "../lib/schema_validation.js";
import type { CreateConversationPayload } from "../types/conversation.type.js";
import ConversationService from "../services/conversation.service.js";
import sendResponse from "../lib/sendResponse.js";
import prisma from "../prisma/prisma.js";
import HttpException from "../lib/exception.js";

export default class ConversationController {
  private conversationService = new ConversationService();
  constructor() {}

  public getConversationById(req: Request & IReqObject, res: Response) {
    // get conversation by id
  }

  public async getAllConversationsByWidgetAccount(
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
    const chatWidgetAccount = await prisma.chatWidgetAccount.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!chatWidgetAccount) {
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Account doesn't exist",
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
  public async processConversation(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const conversation_id = req.params.conversation_id;
    const payload = req.body as { query: string };

    await ZodValidation(processConversationSchema, payload, req.serverUrl);

    const conversation = await prisma.conversations.findFirst({
      where: {
        id: conversation_id,
      },
    });

    if (!conversation) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Conversation not found",
        404
      );
    }

    const userAccount = await prisma.users.findFirst({
      where: {
        uId: user.id,
      },
    });

    const chatwidgetAccount = await prisma.chatWidgetAccount.findFirst({
      where: {
        id: user.id,
      },
    });

    if (chatwidgetAccount && !userAccount) {
      // agent -> customer  | customer -> agent
      await this.manageCustomerAgentInteraction(req, res, {
        query: payload.query,
        conv_id: conversation_id,
      });
    }
    if (userAccount && !chatwidgetAccount) {
      // customer -> admin | admin -> customer
      await this.manageCustomerAdminInteraction(req, res, {
        query: payload.query,
        conv_id: conversation_id,
      });
    }
  }

  // CUSTOMER -> AGENT | AGENT -> CUSTOMER
  public async manageCustomerAgentInteraction(
    req: Request & IReqObject,
    res: Response,
    data: { query: string; conv_id: string }
  ) {}

  // CUSTOMER -> ADMIN | ADMIN -> CUSTOMER
  public async manageCustomerAdminInteraction(
    req: Request & IReqObject,
    res: Response,
    data: { query: string; conv_id: string }
  ) {}
}

// create conversation account (mean't for users interracting via chatbot widget)
