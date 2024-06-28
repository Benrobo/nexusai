import express from "express";
import useCatchErrors from "../lib/error.js";
import KbController from "../controller/knowledgebase.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { multerUpload } from "../config/multer.js";
import TwilioWebhookHandler from "../webhook/twilio.wh.js";
import LSWebhookHandler from "../webhook/LS.wh.js";

export default class WebhookRoute {
  router = express.Router();
  path = "/webhook";
  twWebhookHandler = new TwilioWebhookHandler();
  lsWebhookHandler = new LSWebhookHandler();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // PARENT WH
    this.router.get(`${this.path}`, (req, res) => {
      res.status(200).json({
        msg: "You've reached Nexus webhook, how can i help you?",
      });
    });

    //* TWILIO WEBHOOK HANDLER'S
    this.router.get(`${this.path}/twilio`, (req, res) => {
      res.status(200).json({
        msg: "Twilio incoming call webhook is up and running",
      });
    });

    // twilio incoming call (TIC)
    this.router.all(
      `${this.path}/twilio/voice`,
      useCatchErrors(
        this.twWebhookHandler.incomingCall.bind(this.twWebhookHandler)
      )
    );

    this.router.all(
      `${this.path}/twilio/voice/process/anti-theft`,
      useCatchErrors(
        this.twWebhookHandler.processAntiTheftCall.bind(this.twWebhookHandler)
      )
    );

    this.router.all(
      `${this.path}/twilio/voice/process/sales-assistant`,
      useCatchErrors(
        this.twWebhookHandler.processSalesAssistantCall.bind(
          this.twWebhookHandler
        )
      )
    );

    // twilio phone number subscription (Lemonsqueezy)
    this.router.all(
      `${this.path}/tw-phone/subscription`,
      this.lsWebhookHandler.twilioPhoneSubscription.bind(this.lsWebhookHandler)
    );
  }
}
