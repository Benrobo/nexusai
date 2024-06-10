import redis from "../config/redis.js";
import HttpException from "./exception.js";
import { RESPONSE_CODE } from "../types/index.js";

interface IStoredOTP {
  otp: number;
  phone: string;
}

export default class OTPManager {
  constructor() {}

  public generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  // send otp to phone number
  public async sendOTP(phone: string, userId: string) {
    if (!phone || phone.length === 0) {
      console.log(`Invalid phone number: ${phone}`);
      return false;
    }

    //1. store OTP in redis for 5 mins
    const otp = this.generateOTP();
    const ttl = 5 * 60 * 1000; // 5 mins
    await redis.set(
      userId,
      JSON.stringify({
        otp,
        phone,
      })
    );
    await redis.expire(userId, ttl);

    console.log(`\nOTP sent to phone: ${phone} is ${otp}\n`);

    //2. send OTP to phone number
    // IMPLEMENT TWILLIO FOR SENDING SMS

    //3. return success response
    return true;
  }

  public async verifyOTP(userId: string, otpCode: string) {
    const otp = JSON.parse(await redis.get(userId)) as IStoredOTP;
    if (!otp) {
      throw new HttpException(RESPONSE_CODE.INVALID_OTP, "Invalid OTP", 400);
    }

    if (Number(otp.otp) !== Number(otpCode)) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_OTP,
        "Invalid OTP Code",
        400
      );
    }

    // delete OTP from redis
    await redis.del(userId);

    return otp;
  }
}
