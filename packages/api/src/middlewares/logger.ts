import logger from "../config/logger";
import { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { method, path } = req;
  return new Promise((resolve, reject) => {
    req.on("end", () => {
      const { statusCode } = res;
      console.log("");
      logger.info(`${method.toUpperCase()}: ${path} ${statusCode}`);
      resolve(1);
    });
  }).then(next() as any);
};
