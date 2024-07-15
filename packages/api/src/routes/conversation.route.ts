import express from "express";
import useCatchErrors from "../lib/error.js";
import ConversationController from "../controller/conversation.controller.js";
import {
  dualUserAuthenticator,
  isAuthenticated,
  isWidgetAccountAuthenticated,
} from "../middlewares/auth.js";

export default class ConversationRoute {
  router = express.Router();
  conversationController = new ConversationController();
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
          this.conversationController.getAllConversationsAdmin.bind(
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

    // get all conversations tied to a widget user account
    this.router.get(
      `${this.path}s/widget-account`,
      useCatchErrors(
        isWidgetAccountAuthenticated(
          this.conversationController.getAllConversationsByWidgetAccount.bind(
            this.conversationController
          )
        )
      )
    );

    // create conversation
    this.router.post(
      `${this.path}`,
      useCatchErrors(
        isWidgetAccountAuthenticated(
          this.conversationController.createConversation.bind(
            this.conversationController
          )
        )
      )
    );

    // get conversation messages
    this.router.get(
      `${this.path}/messages/admin/:conversation_id`,
      useCatchErrors(
        isAuthenticated(
          this.conversationController.getChatMessagesAdmin.bind(
            this.conversationController
          )
        )
      )
    );

    // escalate conversation
    this.router.patch(
      `${this.path}/escalate/:conversation_id`,
      useCatchErrors(
        isAuthenticated(
          this.conversationController.escalateConversation.bind(
            this.conversationController
          )
        )
      )
    );

    // process interaction
    this.router.post(
      `${this.path}/process/:conversation_id`,
      useCatchErrors(
        dualUserAuthenticator(
          this.conversationController.processConversation.bind(
            this.conversationController
          )
        )
      )
    );
  }
}
