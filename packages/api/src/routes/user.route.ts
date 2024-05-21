import express from "express";
import useCatchErrors from "../lib/error";
import UserController from "../controller/user.controller";
import { isAuthenticated } from "../middlewares/auth";
import { checkUserSubscription } from "middlewares/subscription";

export default class UserRoute {
  router = express.Router();
  userController = new UserController();
  path = "/user";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // get user data
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          checkUserSubscription(
            this.userController.getUser.bind(this.userController)
          )
        )
      )
    );

    // rotate token
    this.router.patch(
      `${this.path}/token`,
      useCatchErrors(
        isAuthenticated(
          this.userController.rotateToken.bind(this.userController)
        )
      )
    );
  }
}
