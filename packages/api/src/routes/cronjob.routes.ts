import express from "express";
import useCatchErrors from "../lib/error.js";
import {
  deleteExpiredSubscriptionGracePeriods,
  deleteOldFilesAndCachedData,
} from "../cron-job/index.cron.js";
import { authorizeCronFunction } from "../middlewares/auth.js";
import { Response } from "express";

export default class CronJobRoute {
  router = express.Router();
  path = "/cronjob";

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}/deleteOldFilesAndCachedData`,
      useCatchErrors(
        authorizeCronFunction(async (_, res: Response) => {
          await deleteOldFilesAndCachedData();
          res
            .status(200)
            .send("Executing cron job to delete old files and cached data.");
        })
      )
    );

    this.router.post(
      `${this.path}/deleteExpiredSubscription`,
      useCatchErrors(
        authorizeCronFunction(async (_, res: Response) => {
          await deleteExpiredSubscriptionGracePeriods();
          res
            .status(200)
            .send(
              "Executing cron job to delete expired subscription grace periods."
            );
        })
      )
    );
  }
}
