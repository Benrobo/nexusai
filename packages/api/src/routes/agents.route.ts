import express from "express";
import useCatchErrors from "../lib/error";
import AgentController from "../controller/agent.controller";
import { isAuthenticated } from "../middlewares/auth";

export default class AgentRoute {
  router = express.Router();
  agentController = new AgentController();
  path = "/agent";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}s`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getAgents.bind(this.agentController)
        )
      )
    );

    this.router.post(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.createAgent.bind(this.agentController)
        )
      )
    );
  }
}
