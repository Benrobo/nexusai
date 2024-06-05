import express from "express";
import useCatchErrors from "../lib/error";
import KbController from "../controller/knowledgebase.controller";
import { isAuthenticated } from "../middlewares/auth";

export default class KnowledgeBaseRoute {
  router = express.Router();
  kbController = new KbController();
  path = "/knowledgebase";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(this.kbController.createKb.bind(this.kbController))
      )
    );
  }
}
