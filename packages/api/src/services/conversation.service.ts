import shortUUID from "short-uuid";
import type { ConvSignupPayload } from "../types/conversation.type";
import JWT from "../lib/jwt.js";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";

export default class ConversationService {
  constructor() {}

  public async createConvAccount(data: ConvSignupPayload) {
    // check if email already exists
    const checkEmail = await prisma.conversationAccount.findFirst({
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

    // create conversation account
    const uId = shortUUID.generate();

    const account = await prisma.conversationAccount.create({
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

  public async updateConvAccount(
    acct_id: string,
    data: ConvSignupPayload & { verified: boolean; refresh_token: string }
  ) {
    // check if account exists
    const checkAcct = await prisma.conversationAccount.findFirst({
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
    const account = await prisma.conversationAccount.update({
      where: {
        id: acct_id,
      },
      data: {
        ...data,
      },
    });

    return account;
  }

  public async getConvAcctByEmail(email: string) {
    const acct = await prisma.conversationAccount.findFirst({
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

  public async getConversationById(id: string): Promise<any> {
    // get conversation by id
  }

  public async getConversations(): Promise<any> {
    // get all conversations
  }

  public async createConversation(data: any): Promise<any> {
    // create conversation
  }
}
