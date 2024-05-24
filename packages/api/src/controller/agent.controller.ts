import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE, IReqObject } from "../types";
import ZodValidation from "../lib/zodValidation";
import { createWorkspaceSchema } from "../lib/schema_validation";
import HttpException from "../lib/exception";

interface ICreateAG {
  name: string;
}

export default class AgentController extends BaseController {
  constructor() {
    super();
  }

  async createAgent(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as ICreateAG;

    // await ZodValidation(createWorkspaceSchema, payload, req.serverUrl!);
  }

  async getAgents(req: Request & IReqObject, res: Response) {
    const user = req["user"];
  }
}
