import jwt from "jsonwebtoken";
import { Request } from "express";

interface DecodedToken {
  uId: string;
}

export default class JWT {
  constructor() {}

  public static async generateToken(payload: any, type: "access" | "refresh") {
    // generate token
    if (type === "access") {
      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "30 days",
      });
    }
    // 12 month
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "365 days" });
  }

  public static async verifyToken(token: string) {
    // verify token
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  public async getToken(req: Request) {
    const token = req.cookies["token"];
    if (!token) {
      return null;
    }
    // verify token
    const decoded = await JWT.verifyToken(token);
    if (!decoded) {
      return null;
    }
    return decoded as DecodedToken;
  }
}
