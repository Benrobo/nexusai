import express from "express";
import useCatchErrors from "../lib/error.js";
import UserController from "../controller/user.controller.js";
import AuthService from "../services/auth.service.js";
import SubscriptionController from "../controller/subscription.controller.js";

export default class SubscriptionRoute {
  router = express.Router();
  subController = new SubscriptionController();
  path = "/subscription";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // login
    // this.router.post(
    //   `${this.path}/google`,
    //   useCatchErrors(this.authService.googleAuth.bind(this.authService))
    // );
  }
}
