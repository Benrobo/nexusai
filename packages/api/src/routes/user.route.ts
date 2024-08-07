import express from "express";
import useCatchErrors from "../lib/error.js";
import UserController, {
  ChatWidgetUserController,
} from "../controller/user.controller.js";
import {
  isAuthenticated,
  isWidgetAccountAuthenticated,
} from "../middlewares/auth.js";

export default class UserRoute {
  router = express.Router();
  userController = new UserController();
  widgetUserController = new ChatWidgetUserController();
  path = "/user";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // get user data
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(this.userController.getUser.bind(this.userController))
      )
    );

    this.router.get(
      `${this.path}/conversation/sentiment`,
      useCatchErrors(
        isAuthenticated(
          this.userController.retrieveSentimentAnalysisOfUsersConversations.bind(
            this.userController
          )
        )
      )
    );

    this.router.get(
      `${this.path}/conversation/:conversation_id/sentiment`,
      useCatchErrors(
        isAuthenticated(
          this.userController.retrieveSentimentAnalysisOfConversationMessages.bind(
            this.userController
          )
        )
      )
    );

    this.router.get(
      `${this.path}/call-logs/sentiment`,
      useCatchErrors(
        isAuthenticated(
          this.userController.retrieveSentimentAnalysisOfCallLogs.bind(
            this.userController
          )
        )
      )
    );

    this.router.get(
      `${this.path}/metrics/agents`,
      useCatchErrors(
        isAuthenticated(
          this.userController.getTotalAgents.bind(this.userController)
        )
      )
    );

    this.router.get(
      `${this.path}/metrics/knowledgebase`,
      useCatchErrors(
        isAuthenticated(
          this.userController.getTotalKnowledgeBase.bind(this.userController)
        )
      )
    );

    this.router.get(
      `${this.path}/metrics/ai-messages`,
      useCatchErrors(
        isAuthenticated(
          this.userController.getTotalAIMessages.bind(this.userController)
        )
      )
    );

    this.router.get(
      `${this.path}/metrics/conversations`,
      useCatchErrors(
        isAuthenticated(
          this.userController.getTotalConversations.bind(this.userController)
        )
      )
    );

    this.router.get(
      `${this.path}/metrics/customer-growth`,
      useCatchErrors(
        isAuthenticated(
          this.userController.getCustomerGrowthStats.bind(this.userController)
        )
      )
    );

    // Widget Account Section
    this.router.get(
      `${this.path}/chat-widget-account/:agent_id`,
      useCatchErrors(
        isWidgetAccountAuthenticated(
          this.widgetUserController.getAccount.bind(this.widgetUserController)
        )
      )
    );

    // signup conversation acct
    this.router.post(
      `${this.path}/chat-widget-account/signup`,
      useCatchErrors(
        this.widgetUserController.signUp.bind(this.widgetUserController)
      )
    );

    this.router.patch(
      `${this.path}/chat-widget-account/verify`,
      useCatchErrors(
        this.widgetUserController.verifyAccount.bind(this.widgetUserController)
      )
    );

    this.router.post(
      `${this.path}/chat-widget-account/signin`,
      useCatchErrors(
        this.widgetUserController.otpSignIn.bind(this.widgetUserController)
      )
    );

    // delete account
    this.router.delete(
      `${this.path}/chat-widget-account`,
      useCatchErrors(
        isWidgetAccountAuthenticated(
          this.widgetUserController.deleteAccount.bind(
            this.widgetUserController
          )
        )
      )
    );

    this.router.post(
      `${this.path}/chat-widget-account/logout`,
      useCatchErrors(
        isWidgetAccountAuthenticated(
          this.widgetUserController.logoutWidgetAccount.bind(
            this.widgetUserController
          )
        )
      )
    );
  }
}
