import type { NextFunction, Request, Response } from "express";
import redis from "../config/redis.js";
import { type IReqObject } from "../types/index.js";
import logger from "../config/logger.js";

// rate limit send OTP route to 1 request per minute
// using redis

export default function rateLimit(fn: Function) {
  return async (req: Request & IReqObject, res: Response) => {
    const userId = req.user.id;
    const ip = req.ip;
    const key = `rate-limit:${ip}`;

    const data = await redis.get(key);
    if (!data) {
      // set key to expire in 1 minute
      const exp = 20; // 20sec
      await redis.set(key, userId);
      await redis.expire(key, exp);

      return await fn(req, res);
    } else {
      logger.info("Rate limit exceeded");
      res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }
  };
}
