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
  }
}
