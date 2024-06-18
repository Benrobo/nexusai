import express from "express";
import useCatchErrors from "../lib/error.js";
import CheckoutController from "../controller/checkout.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export default class CheckoutRoute {
  router = express.Router();
  checkoutController = new CheckoutController();
  path = "/checkout";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // create twilio phone subscription checkout
    this.router.get(
      `${this.path}/tw-phone`,
      useCatchErrors(
        isAuthenticated(
          this.checkoutController.createTwPhoneCheckout.bind(
            this.checkoutController
          )
        )
      )
    );

    this.router.post(
      `${this.path}/tw-phone/buy`,
      useCatchErrors(
        isAuthenticated(
          this.checkoutController.buyTwilioNumber.bind(this.checkoutController)
        )
      )
    );
  }
}
