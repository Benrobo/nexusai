import express from "express";
import useCatchErrors from "../lib/error.js";
import ConversationController, {
  ConversationAuthController,
} from "../controller/conversation.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export default class ConversationRoute {
  router = express.Router();
  conversationController = new ConversationController();
  convAuthController = new ConversationAuthController();
  path = "/conversation";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.conversationController.getConversations.bind(
            this.conversationController
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
