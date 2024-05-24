import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE, IReqObject } from "../types";

export default class WorkspaceController extends BaseController {
  constructor() {
    super();
  }

  async createBusiness(req: Request & IReqObject, res: Response) {}
}
