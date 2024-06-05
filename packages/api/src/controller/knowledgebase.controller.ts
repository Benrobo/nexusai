import { Request, Response } from "express";
import type { IReqObject } from "types";
import BaseController from "./base.controller";

export default class KnowledgeBaseController extends BaseController {
  constructor() {
    super();
  }

  public async createKb(req: Request & IReqObject, res: Response) {}
}
