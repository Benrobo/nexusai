import { Request, Response } from "express";
import BaseController from "./base.controller";
import sendResponse from "../lib/sendResponse";
import { RESPONSE_CODE } from "../types";
import type { IMiddlewareSubResponseData } from "../middlewares/subscription";
import shortUUID from "short-uuid";

export default class UserController extends BaseController {
  constructor() {
    super();
  }

  async getUser(req: Request, res: Response) {
    const user = req["user"];
    const subData = (req as any)["user_sub_resp"] as IMiddlewareSubResponseData;
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
      snapx_token: userData?.snapx_token,
      subscription: subData?.subscription,
      isPremiumUser: subData?.isPro,
      sub_expired: subData?.expired ?? true,
      // isProResp: subData,
    });
  }

  public async rotateToken(req: Request, res: Response) {
    const userId = (req as any)?.user?.id;

    const newToken = shortUUID.generate().slice(0, 11);

    await prisma.users.update({
      where: { uId: userId },
      data: { snapx_token: newToken },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Token rotated successfully.",
      200,
      { snapx_token: newToken }
    );
  }
}
