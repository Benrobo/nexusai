import express from "express";
import useCatchErrors from "../lib/error.js";
import CallLogsController from "../controller/call-logs.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

export default class CallLogsRoute {
  router = express.Router();
  callLogsController = new CallLogsController();
  path = "/call-logs";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.callLogsController.getCallLogs.bind(this.callLogsController)
        )
      )
    );

    this.router.get(
      `${this.path}/unread`,
      useCatchErrors(
        isAuthenticated(
          this.callLogsController.getUnreadLogs.bind(this.callLogsController)
        )
      )
    );

    this.router.patch(
      `${this.path}/mark-read/:id`,
      useCatchErrors(
        isAuthenticated(
          this.callLogsController.markLogAsRead.bind(this.callLogsController)
        )
      )
    );

    this.router.delete(
      `${this.path}/:id`,
      useCatchErrors(
        isAuthenticated(
          this.callLogsController.deleteCallLog.bind(this.callLogsController)
        )
      )
    );

    this.router.get(
      `${this.path}/analysis/:id`,
      useCatchErrors(
        isAuthenticated(
          this.callLogsController.getSentimentAnalysis.bind(
            this.callLogsController
          )
        )
      )
    );
  }
}
