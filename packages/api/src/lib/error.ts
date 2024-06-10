import { RESPONSE_CODE } from "../types/index.js";
import HttpException from "./exception.js";
import sendResponse from "./sendResponse.js";
import { Request, Response } from "express";

export default function useCatchErrors(fn: Function) {
  return async function (req: Request, res: Response) {
    try {
      return await fn(req, res);
    } catch (err: any) {
      const code = RESPONSE_CODE[err.code as any];
      console.log(`😥 Error [${code}]: ${err?.message}`);
      console.log(err);
      if (err instanceof HttpException) {
        return sendResponse.error(
          res,
          err.code,
          err.message,
          err.statusCode,
          err
        );
      }

      return sendResponse.error(
        res,
        RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        "INTERNAL SERVER ERROR",
        500,
        err
      );
    }
  };
}
