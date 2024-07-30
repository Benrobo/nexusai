import express from "express";
import useCatchErrors from "../lib/error.js";
import BackgroundJobService from "../services/background-job.service.js";

export default class BgJobRoute {
  jobService = new BackgroundJobService();
  router = express.Router();
  path = "/bg-job";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/process/:type`,
      useCatchErrors(this.jobService.processJob.bind(this.jobService))
    );
  }
}
