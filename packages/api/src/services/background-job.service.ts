import { Client } from "@upstash/qstash";
import env from "../config/env.js";
import { Request, Response } from "express";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";
import logger from "../config/logger.js";
import { sendSMS } from "../helpers/twilio.helper.js";
import sendMail from "../helpers/sendMail.js";

type JobType = "send-sms" | "send-mail";

type SendSmsData = {
  from: string;
  to: string;
  message: string;
};

type SendMailData = {
  to: string;
  html: string;
  subject: string;
};

interface SendSmsJob {
  type: "send-sms";
  data: SendSmsData;
}

interface SendMailJob {
  type: "send-mail";
  data: SendMailData;
}

type JobPayload = SendSmsJob | SendMailJob;

export default class BackgroundJobService {
  private qstashClient = new Client({
    token: env.QSTASH.TOKEN,
  });

  constructor() {}

  public async processJob(req: Request, res: Response) {
    const body = req.body as JobPayload;
    const jobType = req.params["type"] as JobType;

    console.log({ body });

    if (!jobType || !body.data) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Invalid job payload",
        400
      );
    }

    switch (body.type) {
      case "send-sms":
        await this.sendSms(body.data);
        break;
      case "send-mail":
        await this.sendUserMail(body.data);
        break;
      default:
        break;
    }
  }

  private async sendSms(data: SendSmsData) {
    const { from, message, to } = data;
    await sendSMS(from, to, message);
  }

  private async sendUserMail(data: SendMailData) {
    const { to, html, subject } = data;
    await sendMail({ to, html, subject });
  }

  public async publishJob(job: JobPayload) {
    try {
      await this.qstashClient.publishJSON({
        url: env.API_URL + "/bg-job/process/" + job.type,
        body: job,
        delay: 60,
      });

      logger.info(`[${job.type.toUpperCase()}]: Job published`, job);
    } catch (e: any) {
      console.log(e);
      logger.error(`[${job.type.toUpperCase()}]: Error publishing job`, e);
    }
  }
}
