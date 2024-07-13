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

    // Widget Account Section
    this.router.get(
      `${this.path}/chat-widget-account`,
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

    this.router.post(
      `${this.path}/chat-widget-account/signin`,
      useCatchErrors(
        this.widgetUserController.otpSignIn.bind(this.widgetUserController)
      )
    );
  }
}
