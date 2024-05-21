import express from "express";
import useCatchErrors from "../lib/error";
import LsWebhookHandler from "../services/ls_wh_handler";

export default class WebhookRoute {
  router = express.Router();
  lsWebhokHandler = new LsWebhookHandler();
  path = "/webhook";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // get user data
    this.router.all(
      `${this.path}/lemonsqueezy`,
      useCatchErrors(this.lsWebhokHandler.init.bind(this.lsWebhokHandler))
    );
  }
}
