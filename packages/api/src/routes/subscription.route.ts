import express from "express";
import useCatchErrors from "../lib/error";
import SubscriptionController from "../controller/subscription.controller";
import { isAuthenticated } from "../middlewares/auth";

export default class SubscriptionRoute {
  router = express.Router();
  subscriptionController = new SubscriptionController();
  path = "/subscription";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // switch sub plan
    this.router.post(
      `${this.path}/switch`,
      useCatchErrors(
        isAuthenticated(
          this.subscriptionController.switchSubscriptionPlan.bind(
            this.subscriptionController
          )
        )
      )
    );

    // get customer portal
    this.router.post(
      `${this.path}/portal`,
      useCatchErrors(
        isAuthenticated(
          this.subscriptionController.getCustomerPortal.bind(
            this.subscriptionController
          )
        )
      )
    );

    // subscribe
    this.router.post(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.subscriptionController.subscribe.bind(
            this.subscriptionController
          )
        )
      )
    );

    // get subscriptions
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.subscriptionController.getSubscriptions.bind(
            this.subscriptionController
          )
        )
      )
    );
  }
}
