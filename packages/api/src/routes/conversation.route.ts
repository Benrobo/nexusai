import express from "express";
import useCatchErrors from "../lib/error.js";
import ConversationController, {
  ConversationAuthController,
} from "../controller/conversation.controller.js";
import {
  isAuthenticated,
  isConvAcctAuthenticated,
} from "../middlewares/auth.js";

export default class ConversationRoute {
  router = express.Router();
  conversationController = new ConversationController();
  convAuthController = new ConversationAuthController();
  path = "/conversation";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // get all conversations created by admin / owner of the account
    this.router.get(
      `${this.path}s/admin`,
      useCatchErrors(
        isAuthenticated(
          this.conversationController.getAllConversations.bind(
            this.conversationController
          )
        )
      )
    );

    // get all conversations created by admin / owner of the account filtered by agent
    this.router.get(
      `${this.path}s/admin/:agent_id`,
      useCatchErrors(
        isAuthenticated(
          this.conversationController.getConversationsByAgent.bind(
            this.conversationController
          )
        )
      )
    );

    // get all conversations tied to a conversation account
    this.router.get(
      `${this.path}s/conv-account`,
      useCatchErrors(
        isConvAcctAuthenticated(
          this.conversationController.getAllConversationsByConvAccount.bind(
            this.conversationController
          )
        )
      )
    );

    // create conversation
    this.router.post(
      `${this.path}`,
      useCatchErrors(
        isConvAcctAuthenticated(
          this.conversationController.createConversation.bind(
            this.conversationController
          )
        )
      )
    );

    // Conversation Account Section
    this.router.get(
      `${this.path}/account`,
      useCatchErrors(
        isConvAcctAuthenticated(
          this.convAuthController.getConversationAccount.bind(
            this.convAuthController
          )
        )
      )
    );
    // signup conversation acct
    this.router.post(
      `${this.path}/auth/signup`,
      useCatchErrors(
        this.convAuthController.signUp.bind(this.convAuthController)
      )
    );

    this.router.post(
      `${this.path}/auth/signin`,
      useCatchErrors(
        this.convAuthController.otpSignIn.bind(this.convAuthController)
      )
    );
  }
}
