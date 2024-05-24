import express from "express";
import useCatchErrors from "../lib/error";
import WorkspaceController from "../controller/business.controller";
import { isAuthenticated } from "../middlewares/auth";

export default class WorkspaceRoute {
  router = express.Router();
  workspaceController = new WorkspaceController();
  path = "/business";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    // get user data
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.workspaceController.createBusiness.bind(this.workspaceController)
        )
      )
    );
  }
}
