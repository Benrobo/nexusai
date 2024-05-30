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

    // get specific agent details
    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getAgent.bind(this.agentController)
        )
      )
    );

    // send otp to phone number
    this.router.post(
      `${this.path}/send-otp`,
      useCatchErrors(
        isAuthenticated(this.agentController.sendOTP.bind(this.agentController))
      )
    );

    // verify phone number
    this.router.post(
      `${this.path}/verify-phone`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.verifyPhone.bind(this.agentController)
        )
      )
    );

    // get used numbers
    this.router.get(
      `${this.path}/used-numbers`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getUsedPhoneNumbers.bind(this.agentController)
        )
      )
    );

    // publish an agent
    this.router.patch(
      `${this.path}/publish/:id`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.publishAgent.bind(this.agentController)
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
