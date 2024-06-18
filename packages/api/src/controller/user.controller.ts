import { Request, Response } from "express";
import BaseController from "./base.controller.js";
import sendResponse from "../lib/sendResponse.js";
import { RESPONSE_CODE, IReqObject } from "../types/index.js";
import prisma from "../prisma/prisma.js";

export default class UserController extends BaseController {
  constructor() {
    super();
  }

  async getUser(req: Request & IReqObject, res: Response) {
    const user = req["user"] as any;
    const userData = await prisma.users.findFirst({
      where: {
        uId: user.id,
      },
    });

    return sendResponse.success(res, RESPONSE_CODE.SUCCESS, "Success", 200, {
      id: userData?.uId,
      email: userData?.email,
      username: userData?.username,
      full_name: userData?.fullname ?? "",
      avatar: userData?.avatar,
      role: userData?.role,
    });
  }
}
