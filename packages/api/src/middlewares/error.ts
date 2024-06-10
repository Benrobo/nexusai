import { NextFunction, Request, Response } from "express";
import logger from "../config/logger.js";

export default function HandleErrors(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err);

  res.status(500).json({
    code: "--api/server-error",
    message: "Something went wrong",
    details: {
      stacks: process.env.NODE_ENV !== "production" && err?.stack,
    },
  });
}
