import { Request, Response } from "express";
import ZodValidation from "../lib/zodValidation";
import { emailSchema, loginSchema } from "../lib/schema_validation";
import redis from "../config/redis";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE } from "../types";
import prisma from "../config/prisma";
import HttpException from "../lib/exception";
import shortUUID from "short-uuid";
import env from "../config/env";

export default class AuthService {
  constructor() {}

  public async googleAuth(req: Request, res: Response) {}
}
