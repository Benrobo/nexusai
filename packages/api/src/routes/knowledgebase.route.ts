import express from "express";
import useCatchErrors from "../lib/error.js";
import KbController from "../controller/knowledgebase.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { multerUpload } from "../config/multer.js";

export default class KnowledgeBaseRoute {
  router = express.Router();
  kbController = new KbController();
  path = "/knowledge-base";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}`,
      multerUpload.single("file"),
      useCatchErrors(
        isAuthenticated(this.kbController.addKb.bind(this.kbController))
      )
    );

    this.router.get(
      `${this.path}/:id`,
      useCatchErrors(
        isAuthenticated(
          this.kbController.getKnowledgeBase.bind(this.kbController)
        )
      )
    );

    this.router.get(
      `${this.path}`,
      useCatchErrors(
        isAuthenticated(
          this.kbController.getAllKnowledgeBase.bind(this.kbController)
        )
      )
    );

    this.router.post(
      `${this.path}/retrain`,
      useCatchErrors(
        isAuthenticated(this.kbController.retrainData.bind(this.kbController))
      )
    );

    this.router.post(
      `${this.path}/crawl-page`,
      useCatchErrors(
        isAuthenticated(this.kbController.crawlWebpage.bind(this.kbController))
      )
    );

    this.router.post(
      `${this.path}/link`,
      useCatchErrors(
        isAuthenticated(this.kbController.linkKbToAgent.bind(this.kbController))
      )
    );

    this.router.post(
      `${this.path}/unlink`,
      useCatchErrors(
        isAuthenticated(
          this.kbController.unlinkKbFromAgent.bind(this.kbController)
        )
      )
    );

    // delete kb
    this.router.delete(
      `${this.path}/:agent_id/:kb_id`,
      useCatchErrors(
        isAuthenticated(this.kbController.deleteKb.bind(this.kbController))
      )
    );
  }
}
