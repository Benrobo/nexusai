import express from "express";
import useCatchErrors from "../lib/error.js";
import AgentController from "../controller/agent.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

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
      `${this.path}/:id`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getAgent.bind(this.agentController)
        )
      )
    );

    this.router.get(
      `${this.path}/settings/:id`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getAgentSettings.bind(this.agentController)
        )
      )
    );

    // get agent active phone number
    this.router.get(
      `${this.path}/active-number/:id`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getActiveAgentNumber.bind(this.agentController)
        )
      )
    );

    this.router.patch(
      `${this.path}/settings`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.updateAgentSettings.bind(this.agentController)
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
      `${this.path}/pn/used`,
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
          this.agentController.activateAgent.bind(this.agentController)
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

    // Link agent to a phone number
    this.router.post(
      `${this.path}/link-phone`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.linkPhoneToAgent.bind(this.agentController)
        )
      )
    );

    // twilio available numbers
    this.router.get(
      `${this.path}/tw/available-numbers`,
      useCatchErrors(
        isAuthenticated(
          this.agentController.getTwilioAvailableNumber.bind(
            this.agentController
          )
        )
      )
    );
  }
}
