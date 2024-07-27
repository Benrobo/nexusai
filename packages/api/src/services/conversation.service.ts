import prisma from "../prisma/prisma.js";

export default class ConversationService {
  constructor() {}

  public async getConversationById(id: string): Promise<any> {
    // get conversation by id
  }

  public async getConversations(): Promise<any> {
    // get all conversations
  }

  public async createConversation(data: { agent_id: string; userId: string }) {
    const conversation = await prisma.conversations.create({
      data: {
        agentId: data.agent_id,
        conversationAccountId: data.userId,
      },
    });

    return conversation;
  }
}
