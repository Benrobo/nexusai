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
      return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2hr" });
    }
    // 1 month
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1m" });
  }

  public static async verifyToken(token: string) {
    // verify token
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  public async getToken(req: Request) {
    // // get token (if i decide to use headers)
    // const authHeader = req.headers["authorization"];
    // const token = authHeader?.split(" ")[1];
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
