import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE, IReqObject } from "../types";
import ZodValidation from "../lib/zodValidation";
import { createWorkspaceSchema } from "../lib/schema_validation";
import HttpException from "../lib/exception";

interface ICreateWS {
  name: string;
}

export default class WorkspaceController extends BaseController {
  constructor() {
    super();
  }

  async createWorkspace(req: Request & IReqObject, res: Response) {
    const user = req["user"];
    const payload = req.body as ICreateWS;

    await ZodValidation(createWorkspaceSchema, payload, req.serverUrl!);

    const workspaceExists = await prisma.workspace.findFirst({
      where: {
        AND: {
          name: payload.name,
          userId: user.id!,
        },
      },
    });

    if (workspaceExists) {
      throw new HttpException(
        RESPONSE_CODE.DUPLICATE_ENTRY,
        "Workspace with this name already exists",
        400
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: payload.name,
        user: {
          connect: {
            uId: user.id!,
          },
        },
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Workspace created successfully",
      200,
      workspace
    );
  }

  async getWorkspace(req: Request & IReqObject, res: Response) {
    const user = req["user"];

    const workspace = await prisma.workspace.findMany({
      where: {
        userId: user.id!,
      },
      include: {
        settings: true,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Workspace fetched successfully",
      200,
      workspace
    );
  }
}
