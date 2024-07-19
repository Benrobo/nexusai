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
import AIService from "../services/AI.service.js";
import { chatbotTemplatePrompt } from "../data/agent/prompt.js";
import GeminiService from "../services/gemini.service.js";
import logger from "../config/logger.js";
import shortUUID from "short-uuid";

export default class ConversationController {
  private conversationService = new ConversationService();
  private aiService = new AIService();
  private geminiService = new GeminiService();
  constructor() {}

  private async getLastMessage(convId: string) {
    return prisma.chatMessages.findFirst({
      where: { convId },
      orderBy: { created_at: "desc" },
    });
  }

  private async getSender(lastMsg: {
    role: "admin" | "customer" | "agent";
    senderId: string;
    agentId: string;
  }) {
    const senderQueries = {
      admin: () =>
        prisma.users.findFirst({
          where: { uId: lastMsg.senderId },
          select: { id: true, fullname: true, avatar: true, email: true },
        }),
      customer: () =>
        prisma.chatWidgetAccount.findFirst({
          where: { id: lastMsg.senderId },
          select: { id: true, name: true },
        }),
      agent: () =>
        prisma.agents.findFirst({
          where: { id: lastMsg.agentId },
          select: { id: true, name: true },
        }),
    };

    return senderQueries[lastMsg.role]?.() || senderQueries.agent();
  }

  private async getChatbotConfig(agentId) {
    return prisma.chatbotConfig.findFirst({
      where: { agentId },
      select: { brand_color: true, text_color: true },
    });
  }

  private async getUnreadCount(convId, role: "admin" | "customer") {
    const isReadClause =
      role === "admin" ? { is_read_admin: false } : { is_read_customer: false };
    return prisma.chatMessages.count({
      where: { convId, ...isReadClause },
    });
  }

  public async getWidgetAccountConversations(
    req: Request & IReqObject,
    res: Response
  ) {
    const user = req.user;
    const chatbotId = req.params["chatbot_id"];

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: { id: chatbotId },
    });

    if (!agent) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Failed to retrieve conversations. Invalid chatbot id.",
        404
      );
    }

    const conversations = await prisma.conversations.findMany({
      where: {
        conversationAccountId: user.id,
        agentId: chatbotId,
      },
    });

    const convWithMessages = [];
    const unreadMessages = new Map();
    const chatbotConfig = [];

    await Promise.all(
      conversations.map(async (nc) => {
        const lastMsg = await this.getLastMessage(nc.id);

        if (lastMsg) {
          const sender = await this.getSender(lastMsg);
          convWithMessages.push({
            ...nc,
            lastMsg: {
              message: lastMsg.content,
              date: lastMsg.created_at,
              sender: { ...sender, role: lastMsg.role },
            },
          });
        }

        const chatbot = await this.getChatbotConfig(nc.agentId);
        chatbotConfig.push({
          agent_id: nc.agentId,
          brand_color: chatbot?.brand_color,
          text_color: chatbot?.text_color,
        });

        const unread = await this.getUnreadCount(nc.id, "customer");
        unreadMessages.set(nc.id, (unreadMessages.get(nc.id) || 0) + unread);
      })
    );

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversations retrieved successfully",
      200,
      {
        unread_messages: Array.from(unreadMessages, ([conv_id, unread]) => ({
          conv_id,
          unread,
        })),
        chatbot_config: chatbotConfig,
        conversations: convWithMessages,
      }
    );
  }

  public async getWidgetAccoutConversationMessages(
    req: Request & IReqObject,
    res: Response
  ) {
    const user = req.user;
    const conversation_id = req.params.conversation_id;
    const chatbotId = req.params.chatbot_id;

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

    if (conversation.agentId !== chatbotId) {
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Unauthorized to view this conversation.",
        403
      );
    }

    const messages = [];
    const allMessages = await prisma.chatMessages.findMany({
      where: {
        convId: conversation.id,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    for (const msg of allMessages) {
      const sender =
        msg?.role === "admin"
          ? await prisma.users.findFirst({
              where: {
                uId: msg.senderId,
              },
              select: {
                id: true,
                fullname: true,
                avatar: true,
                email: true,
              },
            })
          : msg?.role === "customer"
            ? await prisma.chatWidgetAccount.findFirst({
                where: {
                  id: msg.senderId,
                },
                select: {
                  id: true,
                  name: true,
                },
              })
            : await prisma.agents.findFirst({
                where: {
                  id: msg?.agentId,
                },
                select: {
                  id: true,
                  name: true,
                },
              });
      messages.push({
        id: msg.id,
        message: msg.content,
        date: msg.created_at,
        agent_id: msg.agentId,
        sender: {
          role: msg.role,
          ...sender,
        },
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Messages retrieved successfully",
      200,
      {
        admin_in_control: conversation.admin_in_control,
        messages,
      }
    );
  }

  // Admin / Owner Specific
  public async getAllConversationsAdmin(
    req: Request & IReqObject,
    res: Response
  ) {
    const user = req.user;

    const conversations = await prisma.conversations.findMany();
    const adminSpecificAgents = await prisma.agents.findMany({
      where: {
        userId: user.id,
      },
    });

    const newConversations = [];
    for (const ag of adminSpecificAgents) {
      const conv = conversations.filter((c) => c.agentId === ag.id);
      newConversations.push(...conv);
    }

    const convWithMessages = [];
    const unreadMessages = new Map();
    const chatbotConfig = [];

    await Promise.all(
      newConversations.map(async (nc) => {
        const lastMsg = await this.getLastMessage(nc.id);

        if (lastMsg) {
          const sender = await this.getSender(lastMsg);
          convWithMessages.push({
            ...nc,
            lastMsg: {
              message: lastMsg.content,
              date: lastMsg.created_at,
              sender: { ...sender, role: lastMsg.role },
            },
          });
        }

        const chatbot = await this.getChatbotConfig(nc.agentId);
        chatbotConfig.push({
          agent_id: nc.agentId,
          brand_color: chatbot?.brand_color,
          text_color: chatbot?.text_color,
        });

        const unread = await this.getUnreadCount(nc.id, "admin");
        unreadMessages.set(nc.id, (unreadMessages.get(nc.id) || 0) + unread);
      })
    );

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversations retrieved successfully",
      200,
      {
        unread_messages: Array.from(unreadMessages, ([conv_id, unread]) => ({
          conv_id,
          unread,
        })),
        chatbot_config: chatbotConfig,
        conversations: convWithMessages,
      }
    );
  }

  // get all chat messages in a conversation
  public async getChatMessagesAdmin(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const conversation_id = req.params.conversation_id;
    const conversation = await prisma.conversations.findFirst({
      where: {
        id: conversation_id,
      },
    });

    if (!conversation) {
      logger.error(`[Conversation]: ${conversation_id} not found.`);
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Conversation not found",
        404
      );
    }

    const adminSpecificAgents = await prisma.agents.findMany({
      where: {
        userId: user.id,
      },
    });

    if (!adminSpecificAgents.map((a) => a.id).includes(conversation.agentId)) {
      logger.error(
        `[Conversation]: ${conversation_id} not found or unauthorized to view.`
      );
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Unauthorized to view this conversation.",
        403
      );
    }

    const messages = [];
    const allMessages = await prisma.chatMessages.findMany({
      where: {
        convId: conversation.id,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    for (const msg of allMessages) {
      const sender =
        msg?.role === "admin"
          ? await prisma.users.findFirst({
              where: {
                uId: msg.senderId,
              },
              select: {
                id: true,
                fullname: true,
                avatar: true,
                email: true,
              },
            })
          : msg?.role === "customer"
            ? await prisma.chatWidgetAccount.findFirst({
                where: {
                  id: msg.senderId,
                },
                select: {
                  id: true,
                  name: true,
                },
              })
            : await prisma.agents.findFirst({
                where: {
                  id: msg?.agentId,
                },
                select: {
                  id: true,
                  name: true,
                },
              });
      messages.push({
        id: msg.id,
        message: msg.content,
        date: msg.created_at,
        agent_id: msg.agentId,
        sender: {
          ...sender,
          role: msg.role,
        },
      });
    }

    const customerId = allMessages.find((m) => m.role === "customer")?.senderId;
    const customerInfo = await prisma.chatWidgetAccount.findFirst({
      where: {
        id: customerId,
      },
      select: {
        email: true,
        name: true,
        city: true,
        state: true,
        country_code: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Messages retrieved successfully",
      200,
      {
        admin_in_control: conversation.admin_in_control,
        conv_id: conversation.id,
        messages,
        customer_info: customerInfo,
      }
    );
  }

  public async deleteConversation(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const conversation_id = req.params.conversation_id;

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

    const adminSpecificAgents = await prisma.agents.findMany({
      where: {
        userId: user.id,
      },
    });

    if (!adminSpecificAgents.map((a) => a.id).includes(conversation.agentId)) {
      logger.error(
        `[Conversation]: ${conversation_id} not found or unauthorized to delete.`
      );
      throw new HttpException(
        RESPONSE_CODE.FORBIDDEN,
        "Unauthorized to delete this conversation.",
        403
      );
    }

    // delete messages first
    const messagesDeletaed = prisma.chatMessages.deleteMany({
      where: {
        convId: conversation_id,
      },
    });

    const conversationDeleted = prisma.conversations.delete({
      where: {
        id: conversation_id,
      },
    });

    await prisma.$transaction([messagesDeletaed, conversationDeleted]);

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversation deleted successfully",
      200
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
    const payload = req.body as { query: string; response: string };

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
      return await this.manageCustomerAgentInteraction(req, res, {
        query: payload.query,
        conv_id: conversation_id,
        userId: user.id,
      });
    }
    if (userAccount && !chatwidgetAccount) {
      // customer -> admin | admin -> customer
      return await this.manageAdminCustomerInteraction(req, res, {
        response: payload.response,
        conv_id: conversation_id,
        userId: user.id,
      });
    }
  }

  // CUSTOMER -> AGENT | AGENT -> CUSTOMER
  public async manageCustomerAgentInteraction(
    req: Request & IReqObject,
    res: Response,
    data: { query: string; conv_id: string; userId: string }
  ) {
    const customerAccount = await prisma.chatWidgetAccount.findFirst({
      where: {
        id: data.userId,
      },
    });

    const conversation = await prisma.conversations.findFirst({
      where: {
        id: data.conv_id,
      },
      include: {
        agents: {
          select: {
            activated: true,
            id: true,
            type: true,
            userId: true,
            name: true,
          },
        },
      },
    });

    const agent = conversation.agents;

    // check if agent is activated
    if (!agent.activated) {
      logger.error(`[Agent]: ${agent.name} is not activated.`);
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        `${agent.name} is currently unavailable`,
        403
      );
    }

    if (!data.query || data.query.length === 0) {
      throw new HttpException(RESPONSE_CODE.BAD_REQUEST, "Query is empty", 400);
    }
    // store user query
    const msgData = {
      conv_id: data.conv_id,
      role: "customer",
      content: data.query,
      agent_id: agent.id,
      sender_id: data.userId,
      is_customer_read: true,
      is_admin_read: !conversation?.admin_in_control,
    };

    const customerMsgStored = await this.storeChatMessage(msgData as any);

    if (conversation?.admin_in_control) {
      logger.info(
        `[Conversation]: ${data.conv_id} has been escalated to admin`
      );
      throw new HttpException(
        RESPONSE_CODE.CONVERSATION_ESCALATED,
        "Conversation escalated to admin",
        403
      );
    }

    const knowledgebase = await prisma.knowledgeBase.findMany({
      where: {
        userId: agent.userId,
      },
      include: {
        linked_knowledge_base: {
          select: {
            kb_id: true,
            agentId: true,
          },
        },
      },
    });

    const data_source_ids = [];

    for (const kb of knowledgebase) {
      const linked_kb = kb.linked_knowledge_base.find(
        (d) => d.agentId === agent.id
      );
      data_source_ids.push(linked_kb.kb_id);
    }

    const similarities = await this.aiService.vectorSimilaritySearch({
      user_input: data.query,
      data_source_ids,
      agent_id: agent.id,
    });

    const closestMatch = similarities
      .slice(0, 2)
      .map((d) => d.content)
      .join("\n");

    let chatHistoryTxt = "";
    const history = await this.getChatHistory({
      conv_id: data.conv_id,
    });

    history.slice(-5).forEach((h) => {
      chatHistoryTxt += `[${h.role}]: ${h.message}\n`;
    });

    const systemInstruction = chatbotTemplatePrompt({
      agentName: agent.name,
      context: closestMatch.trim(),
      history: chatHistoryTxt,
      query: data.query,
    });

    const aiResp = await this.geminiService.callAI({
      instruction: systemInstruction,
      user_prompt: data.query,
    });

    const aiMsg = aiResp.data;

    // agent
    const aiMsgStored = await this.storeChatMessage({
      conv_id: data.conv_id,
      role: "agent",
      content: aiMsg,
      agent_id: agent.id,
      is_admin_read: true,
      is_customer_read: true,
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversation processed successfully",
      200,
      {
        // user_query: data.query,
        // response: aiMsg,
        agent: {
          message: aiMsgStored.content,
          date: aiMsgStored.created_at,
          sender: {
            id: agent.id,
            name: agent.name,
            role: "agent",
          },
        },
        customer: {
          message: customerMsgStored.content,
          date: customerMsgStored.created_at,
          sender: {
            id: data.userId,
            name: customerAccount.name,
            role: "customer",
          },
        },
      }
    );
  }

  // CUSTOMER -> ADMIN | ADMIN -> CUSTOMER
  public async manageAdminCustomerInteraction(
    req: Request & IReqObject,
    res: Response,
    data: { response: string; conv_id: string; userId: string }
  ) {
    const userAccount = await prisma.users.findFirst({
      where: {
        uId: data.userId,
      },
    });

    if (!data.response || data.response.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Response is empty",
        400
      );
    }

    const conversation = await prisma.conversations.findFirst({
      where: {
        id: data.conv_id,
      },
      include: {
        agents: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!conversation?.admin_in_control) {
      logger.error(
        `[Conversation | Admin]: ${data.conv_id} has not been escalated to admin`
      );
      throw new HttpException(
        RESPONSE_CODE.CONVERSATION_NOT_ESCALATED,
        "Conversation not escalated to admin",
        403
      );
    }

    const agent = conversation.agents;

    // store admin response
    const messageStored = await this.storeChatMessage({
      conv_id: data.conv_id,
      role: "admin",
      content: data.response,
      agent_id: agent.id,
      sender_id: data.userId,
      is_customer_read: false,
      is_admin_read: true,
    });

    // send response to customer
    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Conversation processed successfully",
      200,
      {
        message: messageStored.content,
        date: messageStored.created_at,
        sender: {
          id: data.userId,
          name: userAccount.fullname,
          role: "admin",
          avatar: userAccount.avatar,
        },
      }
    );
  }

  public async markConversationRead(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const userAccount = await prisma.users.findFirst({
      where: { uId: user.id },
    });

    const conversation_id = req.params.conversation_id;

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

    // check if user id exists in one of the messages
    const messagesAssociatedToUser = await prisma.chatMessages.findMany({
      where: {
        convId: conversation_id,
        senderId: user.id,
      },
    });

    if (messagesAssociatedToUser.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "User not found in conversation",
        400
      );
    }

    const unreadWhereClause = userAccount
      ? { is_read_admin: false }
      : { is_read_customer: false };
    const unreadUpdateWhereClause = userAccount
      ? { is_read_admin: true }
      : { is_read_customer: true };

    const unreadMessages = await prisma.chatMessages.findMany({
      where: {
        convId: conversation_id,
        ...unreadWhereClause,
      },
    });

    if (unreadMessages.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "No unread messages",
        400
      );
    }

    const readMsg = await prisma.chatMessages.updateMany({
      where: {
        convId: conversation_id,
        ...unreadWhereClause,
      },
      data: {
        ...unreadUpdateWhereClause,
      },
    });

    const read_messages = {
      conv_id: conversation_id,
      unread: readMsg.count - unreadMessages.length,
    };

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Unread messages updated successfully",
      200,
      {
        read_messages,
      }
    );
  }

  public async switchControl(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const conversation_id = req.params.conversation_id;

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

    let response = "";
    if (conversation.admin_in_control) {
      // releas control
      await prisma.conversations.update({
        where: {
          id: conversation_id,
        },
        data: {
          admin_in_control: false,
        },
      });
      response = "Agent is now in control of this conversation";
    } else {
      // take control
      await prisma.conversations.update({
        where: {
          id: conversation_id,
        },
        data: {
          admin_in_control: true,
        },
      });
      response = "You're now in control of this conversation";
    }

    return sendResponse.success(res, RESPONSE_CODE.SUCCESS, response, 200);
  }

  public async requestHumanSupport(req: Request & IReqObject, res: Response) {}

  private async storeChatMessage(props: {
    conv_id: string;
    role: "agent" | "admin" | "customer";
    content: string;
    sender_id?: string | null;
    agent_id?: string | null;
    is_admin_read?: boolean;
    is_customer_read?: boolean;
  }) {
    const message = await prisma.chatMessages.create({
      data: {
        convId: props.conv_id,
        role: props.role,
        content: props.content ?? "",
        senderId: props.sender_id ?? null,
        agentId: props.agent_id,
        is_read_admin: props.is_admin_read ?? false,
        is_read_customer: props.is_customer_read ?? false,
      },
    });

    return message;
  }

  private async getChatHistory(props: { conv_id: string }) {
    const conversation = await prisma.conversations.findFirst({
      where: {
        id: props.conv_id,
      },
      include: {
        chat_messages: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
    });

    return conversation.chat_messages.map((d) => {
      return {
        role: d.role,
        message: d.content,
      };
    });
  }
}

// create conversation account (mean't for users interracting via chatbot widget)
