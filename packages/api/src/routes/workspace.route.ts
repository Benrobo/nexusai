import express from "express";
import useCatchErrors from "../lib/error";
import WorkspaceController from "../controller/workspace.controller";
import { isAuthenticated } from "../middlewares/auth";

export default class WorkspaceRoute {
  router = express.Router();
  workspaceController = new WorkspaceController();
  path = "/workspace";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.workspaceController.getWorkspace.bind(this.workspaceController)
        )
      )
    );

    this.router.post(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.workspaceController.createWorkspace.bind(
            this.workspaceController
          )
        )
      )
    );
  }
}
